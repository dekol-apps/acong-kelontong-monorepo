import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { AccountingService } from '../accounting/accounting.service';
import { MovedInventoryItemData, InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { CalculateSaleResult, SaleDto, SellingSaleDto } from './sale-dto';
import { SaleItem } from './sale-item.schema';
import { Sale } from './sale.schema';
import { Product } from '../product/product.schema';
import { PaginationDto } from 'src/global/global.dto';
import { FlowType, IListRes, OrderType } from 'src/types/interfaces';
import { Brand } from '../brand/brand.schema';
import Decimal from 'decimal.js';
import { toDecimal, toDecimal128 } from 'src/utils/helper';
import { Accounting } from '../accounting/accounting.schema';

@Injectable()
export class SaleService {
  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => AccountingService))
    private accounting: AccountingService,
    @Inject(forwardRef(() => InventoryMovementService))
    private inventoryMovementSvc: InventoryMovementService,
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @InjectModel(SaleItem.name) private saleItemModel: Model<SaleItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
  ) { }

  /**
   * Add stock to the sale shelf by pulling specific physical units from inventory.
   *
   * Flow:
   *  1. Call moveOutByItemIds — validates + deletes the exact InventoryItem records
   *     the caller selected, captures their landed_cost before deletion, and records
   *     the inventory movement (OUT).
   *  2. For each moved unit, create one SaleItem document with:
   *     - sale pricing from the DTO
   *     - cogs = landed_cost from the source InventoryItem
   */
  async addStock(data: SaleDto, sessionIn?: ClientSession): Promise<SaleItem[] | undefined> {
    return this.global.withTransaction(async (session) => {
      // ─── Build a flat list of all requested inventory item IDs → pricing ──
      // Maps inventoryItemId (string) → the pricing config from that DTO group
      const pricingMap = new Map<
        string,
        { sale_price: number; discount_percent?: number; ppn_rate?: number }
      >();

      for (const group of data.items) {
        for (const id of group.inventory_item_ids) {
          pricingMap.set(id.toString(), {
            sale_price: group.sale_price,
            discount_percent: group.discount_percent,
            ppn_rate: group.ppn_rate,
          });
        }
      }

      const allInventoryItemIds = data.items.flatMap(g => g.inventory_item_ids);

      // ─── Step 1: Move items OUT of inventory, get landed_cost per unit ────
      const result = await this.inventoryMovementSvc.moveOutByItemIds(
        {
          inventory: data.inventory,
          order_type: OrderType.SALE,
          description: 'Stock moved to sale shelf',
        },
        allInventoryItemIds,
        session,
      );
      if (!result) throw BaseResponse.invalid({ err: 'addStock moveOutByItemIds returned undefined' });

      const { movedItems } = result;

      // ─── Step 2: Batch-fetch product & brand info for unique products ─────
      const uniqueProductIds = [...new Set(movedItems.map(i => i.product.toString()))];
      const products = await this.productModel
        .find({ _id: { $in: uniqueProductIds } })
        .session(session)
        .lean();
      const productMap = new Map(products.map(p => [p._id.toString(), p]));

      const brands = await this.brandModel
        .find({ _id: { $in: products.map(p => p.brand) } })
        .session(session)
        .lean();
      const brandMap = new Map(brands.map(b => [b._id.toString(), b]));

      // ─── Step 3: Create one SaleItem per moved physical unit ──────────────
      const createdItems: SaleItem[] = [];

      for (const movedItem of movedItems) {
        const pricing = pricingMap.get(movedItem._id.toString());
        if (!pricing) {
          throw BaseResponse.invalid({ err: `addStock: no pricing found for item ${movedItem._id.toString()}` });
        }

        const product = productMap.get(movedItem.product.toString());
        if (!product) {
          throw BaseResponse.invalid({
            option: { message: 'Product not found' },
            err: 'addStock !product',
          });
        }
        const brand = brandMap.get(product.brand?.toString() ?? '');

        const saleItem: SaleItem = {
          product: movedItem.product,
          product_name: product.product_name,
          brand_name: brand?.brand_name ?? 'MISSING BRAND NAME',
          barcode: product.barcode,
          sale_price: toDecimal128(new Decimal(pricing.sale_price)),
          discount_percent: pricing.discount_percent ?? 0,
          ppn_rate: pricing.ppn_rate ?? 0,
          // COGS = landed_cost of this exact physical unit from inventory
          cogs: movedItem.landed_cost,
        };

        const [created] = await this.saleItemModel.create([saleItem], { session });
        createdItems.push(created);
      }

      return createdItems;
    }, sessionIn);
  }

  async listStock({
    page,
    size,
    sortBy,
    sortDir,
    search,
    filter,
  }: PaginationDto): Promise<IListRes<SaleItem>> {
    const searchFields: string[] = ['product_name', 'barcode', 'brand_name'];

    return this.global.getList<SaleItem>(
      this.saleItemModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter,
      }
    )
  }

  /**
   * Calculate PPN (VAT-inclusive) for a SINGLE physical unit.
   *
   * Given:
   *   - price           = sale price of one unit
   *   - discountPercent = % discount applied
   *   - ppnRate         = VAT % (e.g. 11 for 11%)
   *
   * Steps:
   *   1. net  = price - (price * discountPercent / 100)
   *   2. base = net / (1 + ppnRate/100)   [extract base from VAT-inclusive price]
   *   3. ppn  = net - base
   */
  calculatePPn(
    item: {
      price: Types.Decimal128,
      discount_percent?: number,
      ppn_rate: number
    },
  ) {
    const price = toDecimal(item.price);
    const discountPercent = new Decimal(item.discount_percent || 0);
    const ppnRate = new Decimal(item.ppn_rate || 0).div(100);

    // 1. Apply discount to get net price for one unit
    const discountAmount = price.mul(discountPercent.div(100));
    const net = price.minus(discountAmount);

    // 2. Extract tax base and VAT from the inclusive net price
    const base = net.div(new Decimal(1).plus(ppnRate));
    const ppn = net.minus(base);

    return {
      net,
      discountAmount,
      ppn,
      base,
    };
  }

  /**
   * Sum up totals across all SaleItem documents.
   * Because each SaleItem = 1 physical unit, no per-item qty multiplication needed.
   */
  calculateSale(items: SaleItem[]): CalculateSaleResult {
    let totalBeforeTax = new Decimal(0);
    let totalPpn = new Decimal(0);
    let totalDiscount = new Decimal(0);
    let totalCogs = new Decimal(0);

    for (const item of items) {
      const { ppn, base, discountAmount } = this.calculatePPn({
        price: item.sale_price,
        discount_percent: item.discount_percent,
        ppn_rate: item.ppn_rate
      });
      totalPpn = totalPpn.plus(ppn);
      totalBeforeTax = totalBeforeTax.plus(base);
      totalDiscount = totalDiscount.plus(discountAmount);

      // Accumulate COGS — may be undefined if landed_cost was never set on the inventory item
      if (item.cogs) {
        totalCogs = totalCogs.plus(toDecimal(item.cogs));
      }
    }

    const grandTotal = totalBeforeTax.plus(totalPpn);
    return {
      total_before_tax: toDecimal128(totalBeforeTax),
      total_ppn: toDecimal128(totalPpn),
      grand_total: toDecimal128(grandTotal),
      total_discount: toDecimal128(totalDiscount),
      total_cogs: toDecimal128(totalCogs),
    };
  }

  async selling(dto: SellingSaleDto, sessionIn?: ClientSession): Promise<Sale | undefined> {
    return this.global.withTransaction(async (session) => {
      const itemSold: SaleItem[] = [];

      for (const item of dto.items) {
        // Fetch exactly item_qty individual SaleItem records for this product (FIFO)
        const toConsume = await this.saleItemModel
          .find({ product: item.product })
          .limit(item.item_qty)
          .session(session);

        if (!toConsume || toConsume.length === 0) {
          throw BaseResponse.invalid({ option: { message: 'Sale item not found' } });
        }
        if (toConsume.length < item.item_qty) {
          throw BaseResponse.invalid({ option: { message: 'Insufficient stock' } });
        }

        for (const existItem of toConsume) {
          itemSold.push({
            product: existItem.product,
            brand_name: existItem.brand_name,
            product_name: existItem.product_name,
            barcode: existItem.barcode,
            sale_price: existItem.sale_price,
            discount_percent: existItem.discount_percent,
            ppn_rate: existItem.ppn_rate,
            cogs: existItem.cogs, // carry COGS into the Sale record
          });
          // Remove this physical unit from the sale shelf
          await existItem.deleteOne({ session });
        }
      }

      const totals = this.calculateSale(itemSold);
      const created = (
        await this.saleModel.create(
          [{
            items: itemSold,
            ...totals
          }],
          { session }
        )
      )[0];

      const accountingPayload: Accounting = {
        flow_type: FlowType.IN,
        order_id: created._id,
        order_data: created,
        order_type: OrderType.SALE,
        transaction_amount: totals.grand_total,
      };
      await this.accounting.createAccountingItem(accountingPayload, session);
      return created;
    }, sessionIn);
  }
}

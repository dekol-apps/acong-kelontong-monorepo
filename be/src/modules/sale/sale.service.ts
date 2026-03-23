import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { CalculateSaleResult, SaleDto, SellingSaleDto } from './sale-dto';
import { SaleItem } from './sale-item.schema';
import { Sale } from './sale.schema';
import { Product } from '../product/product.schema';
import { PaginationDto } from 'src/global/global.dto';
import { FlowType, IListRes, OrderType, PPhType, PPnType } from 'src/types/interfaces';
import { Brand } from '../brand/brand.schema';
import Decimal from 'decimal.js';
import { toDecimal, toDecimal128 } from 'src/utils/helper';
import { Accounting } from '../accounting/accounting.schema';
import { defaultPpnRate } from 'src/types/constants';

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
   * Add stock to the sale shelf by pulling physical units from inventory via FIFO.
   *
   * Flow:
   *  1. Call moveOutByProductAndQty — for each item in the DTO, selects the
   *     oldest N InventoryItem records for that product (FIFO), captures their
   *     landed_cost, deletes them, and records the inventory movement (OUT).
   *  2. For each moved unit, create one SaleItem document with:
   *     - sale pricing from the DTO
   *     - cogs = landed_cost from the source InventoryItem
   */
  async addStock(data: SaleDto, sessionIn?: ClientSession): Promise<SaleItem[] | undefined> {
    return this.global.withTransaction(async (session) => {
      // ─── Build a pricing lookup keyed by product ID ───────────────────────
      const pricingMap = new Map<
        string,
        { sale_price: Types.Decimal128; discount_percent?: number }
      >();

      for (const group of data.items) {
        pricingMap.set(group.product.toString(), {
          sale_price: group.sale_price,
          discount_percent: group.discount_percent,
        });
      }

      // ─── Step 1: FIFO move-out by product + qty ───────────────────────────
      const result = await this.inventoryMovementSvc.moveOutByProductAndQty(
        {
          order_type: OrderType.SALE,
          description: 'Stock moved to sale shelf',
        },
        data.items.map(g => ({ product: g.product, item_qty: g.item_qty, original_price: g.original_price })),
        session,
      );
      if (!result) throw BaseResponse.invalid({ err: 'addStock moveOutByProductAndQty returned undefined' });

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
        const pricing = pricingMap.get(movedItem.product.toString());
        if (!pricing) {
          throw BaseResponse.invalid({ err: `addStock: no pricing found for product ${movedItem.product.toString()}` });
        }

        const product = productMap.get(movedItem.product.toString());
        if (!product) {
          throw BaseResponse.invalid({
            option: { message: 'Product not found' },
            err: 'addStock !product',
          });
        }
        const brand = brandMap.get(product.brand?.toString() ?? '');
        const { discountAmount } = this.global.priceAfterDiscount(pricing.sale_price, pricing.discount_percent ?? 0);
        const discount_amount = toDecimal128(discountAmount)
        const saleItem: SaleItem = {
          product: movedItem.product,
          product_name: product.product_name,
          brand_name: brand?.brand_name ?? 'MISSING BRAND NAME',
          barcode: product.barcode,
          original_price: movedItem.original_price,
          original_ppn_rate: movedItem.original_ppn_rate,
          original_ppn_amount: movedItem.original_ppn_amount,
          sale_price: pricing.sale_price,
          discount_percent: pricing.discount_percent ?? 0,
          discount_amount,
          cogs: movedItem.landed_cost,
        };

        const [created] = await this.saleItemModel.create([saleItem], { session });
        createdItems.push(created);
      }

      return createdItems.map(it => this.mapSaleItemData(it)) as any;
    }, sessionIn);
  }

  async listStock(pagination: PaginationDto): Promise<IListRes<SaleItem>> {
    const { page, size, sortBy, sortDir, search, filter } = pagination;
    const searchFields: string[] = ['product_name', 'barcode', 'brand_name'];

    const result = await this.global.getList<SaleItem>(
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
    );

    return {
      ...result,
      data: result.data.map(it => this.mapSaleItemData(it)) as any
    };
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
   *
   * Sum up totals across all SaleItem documents.
   * Because each SaleItem = 1 physical unit, no per-item qty multiplication needed.
   */
  calculateSale(items: SaleItem[]): CalculateSaleResult {
    let totalBeforeTax = new Decimal(0);
    let totalPpn = new Decimal(0);
    let totalDiscount = new Decimal(0);
    let totalCogs = new Decimal(0);

    for (const item of items) {
      // Net price is sale_price after discount
      const salePrice = toDecimal(item.sale_price);
      const discountPercent = item.discount_percent || 0;
      const discountAmount = salePrice.mul(new Decimal(discountPercent).div(100));
      const netPrice = salePrice.minus(discountAmount);

      const { ppn, base } = this.global.getPPnAmount({
        net_price: toDecimal128(netPrice),
        ppn_rate: defaultPpnRate
      });
      totalPpn = totalPpn.plus(ppn);
      totalBeforeTax = totalBeforeTax.plus(base);
      totalDiscount = totalDiscount.plus(toDecimal(item.discount_amount));

      // Accumulate COGS — may be undefined if landed_cost was never set on the inventory item
      if (item.cogs) {
        totalCogs = totalCogs.plus(toDecimal(item.cogs));
      }
    }

    const grandTotal = totalBeforeTax.plus(totalPpn);
    return {
      ppn_rate: defaultPpnRate,
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
            original_price: existItem.original_price,
            original_ppn_rate: existItem.original_ppn_rate,
            original_ppn_amount: existItem.original_ppn_amount,
            sale_price: existItem.sale_price,
            discount_percent: existItem.discount_percent,
            discount_amount: existItem.discount_amount,
            cogs: existItem.cogs, // carry COGS into the Sale record
          });
          // Remove this physical unit from the sale shelf
          await existItem.deleteOne({ session });
        }
      }

      const mappedItemSold = itemSold.map(it => this.mapSaleItemData(it));
      const totals = this.calculateSale(mappedItemSold);
      const created = (
        await this.saleModel.create(
          [{
            items: mappedItemSold,
            total_discount: totals.total_discount,
            total_cogs: totals.total_cogs,
            ppn_rate: totals.ppn_rate,
            total_before_tax: totals.total_before_tax,
            total_ppn: totals.total_ppn,
            grand_total: totals.grand_total,
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
        tax_base: totals.total_before_tax,
        ppn_type: PPnType.INCLUSIVE,
        ppn_rate: totals.ppn_rate,
        ppn_amount: totals.total_ppn,
        record_date: new Date(),
      };
      await this.accounting.createAccountingItem(accountingPayload, session);
      return created;
    }, sessionIn);
  }

  mapSaleItemData(item: any) {
    const salePrice = toDecimal(item.sale_price);
    const discountPercent = item.discount_percent || 0;
    const discountAmount = salePrice.mul(new Decimal(discountPercent).div(100));
    const netPrice = salePrice.minus(discountAmount);

    const { ppn } = this.global.getPPnAmount({
      net_price: toDecimal128(netPrice),
      ppn_rate: defaultPpnRate
    });

    const base = typeof item.toObject === 'function' ? item.toObject() : item;
    return {
      ...base,
      ppn_rate: defaultPpnRate,
      ppn_amount: toDecimal128(ppn),
      net_price: toDecimal128(netPrice),
    };
  }

  async editSelling(id: string, dto: SellingSaleDto, sessionIn?: ClientSession): Promise<Sale | undefined> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.saleModel.findById(id).session(session);
      if (!existing) {
        throw BaseResponse.notFound({ err: 'editSelling !existing' });
      }

      // ─── Constraint 1: 6-hour window ──────────────────────────────────────
      const now = new Date();
      const createdAt = (existing as any).createdAt as Date;
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 3600);
      if (hoursDiff > 6) {
        throw BaseResponse.invalid({
          err: 'editSelling > 6 hours',
          option: { message: 'Cannot edit selling after 6 hours from creation' }
        });
      }

      // ─── Constraint 2: Accounting Snapshot check ──────────────────────────
      const isLockedBySnapshot = await this.accounting.checkSnapshot(createdAt);
      if (isLockedBySnapshot) {
        throw BaseResponse.invalid({
          err: 'editSelling snapshot locked',
          option: { message: 'Cannot edit selling after accounting snapshot has been taken' }
        });
      }

      // ─── Step 1: Revert old items back to the shelf ───────────────────────
      // We recreate SaleItem records using the data stored in the existing Sale.
      for (const item of existing.items) {
        await this.saleItemModel.create([{
          product: item.product,
          brand_name: item.brand_name,
          product_name: item.product_name,
          barcode: item.barcode,
          original_price: item.original_price,
          original_ppn_rate: item.original_ppn_rate,
          original_ppn_amount: item.original_ppn_amount,
          sale_price: item.sale_price,
          discount_percent: item.discount_percent,
          discount_amount: item.discount_amount,
          cogs: item.cogs,
        }], { session });
      }

      // ─── Step 2: Process new items (similar to selling() method) ───────────
      const itemSold: SaleItem[] = [];
      for (const item of dto.items) {
        const toConsume = await this.saleItemModel
          .find({ product: item.product })
          .limit(item.item_qty)
          .session(session);

        if (!toConsume || toConsume.length < item.item_qty) {
          throw BaseResponse.invalid({ option: { message: `Insufficient stock for product ${item.product.toString()}` } });
        }

        for (const existItem of toConsume) {
          itemSold.push({
            product: existItem.product,
            brand_name: existItem.brand_name,
            product_name: existItem.product_name,
            barcode: existItem.barcode,
            original_price: existItem.original_price,
            original_ppn_rate: existItem.original_ppn_rate,
            original_ppn_amount: existItem.original_ppn_amount,
            sale_price: existItem.sale_price,
            discount_percent: existItem.discount_percent,
            discount_amount: existItem.discount_amount,
            cogs: existItem.cogs,
          });
          await existItem.deleteOne({ session });
        }
      }

      const mappedItemSold = itemSold.map(it => this.mapSaleItemData(it));
      const totals = this.calculateSale(mappedItemSold);

      // ─── Step 3: Update existing Sale ─────────────────────────────────────
      const updated = await this.saleModel.findByIdAndUpdate(
        id,
        {
          items: mappedItemSold,
          total_discount: totals.total_discount,
          total_cogs: totals.total_cogs,
          ppn_rate: totals.ppn_rate,
          total_before_tax: totals.total_before_tax,
          total_ppn: totals.total_ppn,
          grand_total: totals.grand_total,
        },
        { session, new: true }
      );

      if (!updated) {
        throw BaseResponse.unexpected({ err: 'editSelling !updated' });
      }

      // ─── Step 4: Update Accounting ───────────────────────────────────────
      await this.accounting.editAccountingByOrderId(
        updated._id as any,
        {
          transaction_amount: totals.grand_total,
          tax_base: totals.total_before_tax,
          ppn_amount: totals.total_ppn,
          ppn_rate: totals.ppn_rate,
          order_data: updated,
          record_date: new Date(),
        },
        session
      );

      return updated;
    }, sessionIn);
  }
}

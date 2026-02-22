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

  async addStock(data: SaleDto, sessionIn?: ClientSession): Promise<SaleItem[] | undefined> {
    return this.global.withTransaction(async (session) => {
      const updatedStock: SaleItem[] = []
      await Promise.all(data.items.map(async item => {
        const product = await this.productModel.findById(item.product).session(session).lean();
        if (!product) {
          throw BaseResponse.invalid({ option: { message: 'Product not found' }, err: 'addStock !product' });
        }
        const brand = await this.brandModel.findById(product.brand).session(session).lean();
        const saleItem: SaleItem = {
          product: item.product,
          product_name: product.product_name,
          brand_name: brand?.brand_name ?? 'MISSING BRAND NAME',
          barcode: product.barcode,
          item_qty: item.item_qty,
          sale_price: item.sale_price,
          discount_percent: item.discount_percent ?? 0,
          ppn_rate: item.ppn_rate ?? 0,
          discount_quota: item.discount_quota ?? 0,
        }
        const exist = await this.saleItemModel.findOne({ product: item.product });
        if (exist) {
          exist.item_qty += item.item_qty;
          exist.sale_price = item.sale_price;
          exist.discount_percent = item.discount_percent ?? 0;
          exist.ppn_rate = item.ppn_rate ?? 0;
          exist.discount_quota += item.discount_quota ?? 0;
          await exist.save({ session });
        } else {
          await this.saleItemModel.create(saleItem);
        }
        updatedStock.push(saleItem);
      }));
      return updatedStock;
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

  calculatePPn(
    item: {
      price: Types.Decimal128,
      qty: number,
      discounted_qty: number,
      discount_percent?: number,
      ppn_rate: number
    },
  ) {
    const price = toDecimal(item.price);
    const totalQty = new Decimal(item.qty);
    const discountedQty = new Decimal(item.discounted_qty || 0);
    const normalQty = totalQty.minus(discountedQty);

    const discountPercent = new Decimal(item.discount_percent || 0);
    const ppnRate = new Decimal(item.ppn_rate || 0).div(100);

    // gross parts
    const grossDiscounted = price.mul(discountedQty);
    const grossNormal = price.mul(normalQty);

    // discount only on discounted qty
    const discountAmount = grossDiscounted.mul(discountPercent.div(100));

    const net =
      grossDiscounted.minus(discountAmount)
        .plus(grossNormal);

    // VAT inclusive logic
    const base = net.div(new Decimal(1).plus(ppnRate));
    const ppn = net.minus(base);

    return {
      net,
      discountAmount,
      ppn,
      base,
    };
  }

  calculateSale(items: SaleItem[]): CalculateSaleResult {
    let totalBeforeTax = new Decimal(0);
    let totalPpn = new Decimal(0);
    let totalDiscount = new Decimal(0);

    for (const item of items) {
      const {
        ppn,
        base,
        discountAmount
      } = this.calculatePPn({
        price: item.sale_price,
        qty: item.item_qty,
        discounted_qty: item.discount_quota, // IMPORTANT
        discount_percent: item.discount_percent,
        ppn_rate: item.ppn_rate
      });
      totalPpn = totalPpn.plus(ppn);
      totalBeforeTax = totalBeforeTax.plus(base);
      totalDiscount = totalDiscount.plus(discountAmount)
    }

    const grandTotal = totalBeforeTax.plus(totalPpn);
    return {
      total_before_tax: toDecimal128(totalBeforeTax),
      total_ppn: toDecimal128(totalPpn),
      grand_total: toDecimal128(grandTotal),
      total_discount: toDecimal128(totalDiscount)
    };
  }

  async selling(dto: SellingSaleDto, sessionIn?: ClientSession): Promise<Sale | undefined> {
    return this.global.withTransaction(async (session) => {
      const itemSold: SaleItem[] = [];
      for (const item of dto.items) {
        const exist = await this.saleItemModel
          .findOne({ product: item.product })
          .session(session);
        if (!exist)
          throw BaseResponse.invalid({ option: { message: 'Sale item not found' } });
        if (exist.item_qty < item.item_qty)
          throw BaseResponse.invalid({ option: { message: 'Insufficient stock' } });
        const discountedQty = Math.min(item.item_qty, exist.discount_quota);
        const remainingQuota = exist.discount_quota - discountedQty;
        itemSold.push({
          product: exist.product,
          brand_name: exist.brand_name,
          product_name: exist.product_name,
          barcode: exist.barcode,
          item_qty: item.item_qty,
          sale_price: exist.sale_price,
          discount_percent: exist.discount_percent,
          ppn_rate: exist.ppn_rate,
          discount_quota: discountedQty // now represents discounted qty snapshot
        });
        // update stock
        exist.item_qty -= item.item_qty;
        exist.discount_quota = remainingQuota;
        await exist.save({ session });
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
      }
      await this.accounting.createAccountingItem(accountingPayload, session)
      return created;
    }, sessionIn);
  }
}

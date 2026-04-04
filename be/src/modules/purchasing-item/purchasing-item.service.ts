import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { Product } from '../product/product.schema';
import { PaymentStatusEn, Purchasing, PurchasingEn } from '../purchasing/purchasing.schema';
import { PurchasingItem } from './purchasing-item.schema';
import { PurchasingItemDto } from './purchasing-item.dto';
import { toDecimal, toDecimal128, toSku } from 'src/utils/helper';
@Injectable()
export class PurchasingItemService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Purchasing.name) private purchasingModel: Model<Purchasing>,
    @InjectModel(PurchasingItem.name) private purchasingItemModel: Model<PurchasingItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async createPurchasingItem(dto: PurchasingItemDto, sessionIn?: ClientSession): Promise<PurchasingItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) {
        throw BaseResponse.notFound({ err: `createPurchasingItem Product not found` });
      }
      const purchasing = await this.purchasingModel.findById(dto.purchase_order).session(session);
      if (!purchasing) {
        throw BaseResponse.notFound({ err: `createPurchasingItem Purchasing not found` });
      }
      const data = {
        supplier_name: purchasing.supplier_name,
        product_name: product.product_name,
        product_sku: product.product_sku || toSku(product.product_name),
        purchase_order: new Types.ObjectId(dto.purchase_order),
        product: new Types.ObjectId(dto.product),
        purchase_qty: dto.purchase_qty,
        purchase_price: toDecimal128(toDecimal(dto.purchase_price)),
      }
      const created = (await this.purchasingItemModel.create([data], { session }))[0];
      if (!created) throw BaseResponse.notFound({ err: 'createPurchasingItem created not found' });
      return created;
    }, sessionIn)
  }

  async editPurchasingItem(
    id: Types.ObjectId,
    dto: PurchasingItemDto,
    sessionIn?: ClientSession
  ): Promise<PurchasingItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchasing = await this.purchasingModel.findById(dto.purchase_order).session(session);
      if (!purchasing) {
        throw BaseResponse.notFound({ err: `editPurchasingItem Purchasing not found` });
      }
      if (purchasing.payment_status !== PaymentStatusEn.UNPAID || purchasing.status === PurchasingEn.RECEIVE || purchasing.status === PurchasingEn.COMPLETE || purchasing.status === PurchasingEn.DROP || purchasing.status === PurchasingEn.EXPIRED) {
        throw BaseResponse.invalid({ err: 'editPurchasingItem invalid status', option: { message: `Cannot edit purchasing item in current status` } });
      }
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) throw BaseResponse.notFound({ err: `editPurchasingItem Product not found` });
      const data = {
        supplier_name: purchasing.supplier_name,
        product_name: product.product_name,
        product_sku: product.product_sku || toSku(product.product_name),
        purchase_order: new Types.ObjectId(dto.purchase_order),
        product: new Types.ObjectId(dto.product),
        purchase_qty: dto.purchase_qty,
        purchase_price: toDecimal128(toDecimal(dto.purchase_price)),
      }
      const updatedItem = await this.purchasingItemModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        },
      ).session(session);
      if (!updatedItem) throw BaseResponse.notFound({ err: 'editPurchasingItem updatedItem not found' });
      return updatedItem || undefined;
    }, sessionIn);
  }

  async detailPurchasingItem(id: Types.ObjectId): Promise<PurchasingItem | undefined> {
    const detailPurchasing = await this.purchasingItemModel
      .findById(id)
      .populate(['purchase_order', 'product'])
      .lean()
      .exec();
    return detailPurchasing || undefined
  }

  async deletePurchasingItem(id: Types.ObjectId, sessionIn?: ClientSession): Promise<PurchasingItem | undefined> {
    return this.global.withTransaction(async (session) => {
      const purchasingItem = await this.purchasingItemModel.findById(id).session(session);
      if (!purchasingItem) throw BaseResponse.notFound({ err: 'deletePurchasingItem not found' });
      await this.global.deleteData(purchasingItem, session);
      return purchasingItem || undefined;
    }, sessionIn);
  }
}

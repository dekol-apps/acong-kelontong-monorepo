import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { GlobalService, IGetListParam } from 'src/global/global.service';
import { BaseResponse } from 'src/utils/base-response';
import { Production, ProductionDocument, ProductionEn } from './production.schema';
import { ProductionDto } from './production.dto';
import { Product } from '../product/product.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';
import Decimal from 'decimal.js';
import { PaginationDto } from 'src/global/global.dto';
import { FlowType, IListRes, OrderType } from 'src/types/interfaces';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => InventoryMovementService))
    private inventoryMovement: InventoryMovementService,
    @InjectModel(Production.name) private productionModel: Model<Production>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  async list(pagination: PaginationDto): Promise<IListRes<ProductionDocument>> {
    const params: IGetListParam = {
      ...pagination,
      searchFields: ['product_name'],
      populate: { column: 'product' },
    };
    return this.global.getList(this.productionModel, params);
  }

  async detail(id: Types.ObjectId): Promise<ProductionDocument> {
    const doc = await this.productionModel.findById(id).populate(['product', 'ingredients.product']).exec();
    if (!doc) throw BaseResponse.notFound({ err: 'Production not found' });
    return doc;
  }

  async create(dto: ProductionDto, sessionIn?: ClientSession): Promise<ProductionDocument> {
    return this.global.withTransaction(async (session) => {
      const product = await this.productModel.findById(dto.product).session(session);
      if (!product) throw BaseResponse.notFound({ err: 'Product not found' });

      const initialIngredients = dto.ingredients.map(i => ({
        product: i.product,
        item_qty: i.item_qty,
        total_cost: toDecimal128(new Decimal(0)),
      }));

      const productionData: Partial<Production> = {
        product: dto.product,
        item_qty: dto.item_qty,
        price_per_item: dto.price_per_item,
        operational_cost: dto.operational_cost,
        grand_total_cost: dto.operational_cost,
        ingredients: initialIngredients,
        status: ProductionEn.CREATE,
      };

      const [created] = await this.productionModel.create([productionData], { session });
      return created;
    }, sessionIn);
  }

  async update(id: Types.ObjectId, dto: ProductionDto | Partial<ProductionDto>, sessionIn?: ClientSession): Promise<ProductionDocument> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.productionModel.findById(id).session(session);
      if (!existing) throw BaseResponse.notFound({ err: 'Production not found' });

      if (existing.status !== ProductionEn.CREATE) {
        throw BaseResponse.invalid({ option: { message: 'Can only edit production in CREATE status' }, err: 'production not in create status' });
      }

      const updateData: Partial<Production> = {
        product: dto.product ?? existing.product,
        item_qty: dto.item_qty ?? existing.item_qty,
        price_per_item: dto.price_per_item ?? existing.price_per_item,
        operational_cost: dto.operational_cost ?? existing.operational_cost,
        grand_total_cost: dto.operational_cost ?? existing.operational_cost,
      };

      if (dto.ingredients) {
        updateData.ingredients = dto.ingredients.map(i => ({
          product: i.product,
          item_qty: i.item_qty,
          total_cost: toDecimal128(new Decimal(0)),
        }));
      }

      const updated = await this.productionModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, session });
      if (!updated) throw BaseResponse.notFound({ err: 'Failed to update production' });
      return updated;
    }, sessionIn);
  }

  async start(id: Types.ObjectId, sessionIn?: ClientSession): Promise<ProductionDocument> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.productionModel.findById(id).session(session);
      if (!existing) throw BaseResponse.notFound({ err: 'Production not found' });

      if (existing.status !== ProductionEn.CREATE) {
        throw BaseResponse.invalid({ option: { message: 'Can only start production from CREATE status' }, err: 'invalid status for start' });
      }

      // Collect ingredients via InventoryMovementService
      const moveOutResult = await this.inventoryMovement.moveOutByProductAndQty(
        {
          order_type: OrderType.PRODUCTION,
          description: `Production START: ${id.toString()}`,
          source_id: existing._id,
        },
        existing.ingredients.map(i => ({ product: i.product, item_qty: i.item_qty })),
        session,
      );

      if (!moveOutResult) throw BaseResponse.unexpected({ err: 'Failed to collect ingredients' });

      // Update ingredient total_costs and production grand_total_cost
      let totalIngredientCost = new Decimal(0);
      const updatedIngredients = existing.ingredients.map(ingredient => {
        const movedForThisProduct = moveOutResult.movedItems.filter(
          m => m.product.toString() === ingredient.product.toString()
        );
        const totalCostForThisIngredient = movedForThisProduct.reduce(
          (acc, curr) => acc.plus(toDecimal(curr.landed_cost)),
          new Decimal(0),
        );
        totalIngredientCost = totalIngredientCost.plus(totalCostForThisIngredient);
        return {
          ...ingredient,
          total_cost: toDecimal128(totalCostForThisIngredient),
        };
      });

      const grandTotalCost = totalIngredientCost.plus(toDecimal(existing.operational_cost));
      existing.ingredients = updatedIngredients;
      existing.grand_total_cost = toDecimal128(grandTotalCost);
      existing.status = ProductionEn.START;

      await existing.save({ session });
      return existing;
    }, sessionIn);
  }

  async finish(id: Types.ObjectId, sessionIn?: ClientSession): Promise<ProductionDocument> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.productionModel.findById(id).session(session);
      if (!existing) throw BaseResponse.notFound({ err: 'Production not found' });

      if (existing.status !== ProductionEn.START) {
        throw BaseResponse.invalid({ option: { message: 'Can only finish production from START status' }, err: 'invalid status for finish' });
      }

      // Move to inventory via InventoryMovementService
      const product = await this.productModel.findById(existing.product).session(session);
      if (!product) throw BaseResponse.notFound({ err: 'Product not found' });

      // Calculate unit cost based on total production cost
      const totalCost = toDecimal(existing.grand_total_cost);
      const unitCost = totalCost.div(new Decimal(existing.item_qty || 1));
      const unitCostDecimal128 = toDecimal128(unitCost);

      await this.inventoryMovement.move(
        {
          movement_type: FlowType.IN,
          order_type: OrderType.PRODUCTION,
          description: `Production FINISH: ${id.toString()}`,
          source_id: existing._id,
          items: [
            {
              product: existing.product,
              item_qty: existing.item_qty,
              receive_date: new Date(),
              original_price: unitCostDecimal128,
              landed_cost: unitCostDecimal128,
              original_ppn_rate: 0,
              original_ppn_amount: toDecimal128(new Decimal(0)),
            },
          ],
        },
        session,
      );

      existing.status = ProductionEn.FINISH;
      await existing.save({ session });
      return existing;
    }, sessionIn);
  }

  async remove(id: Types.ObjectId, sessionIn?: ClientSession): Promise<ProductionDocument> {
    return this.global.withTransaction(async (session) => {
      const existing = await this.productionModel.findById(id).session(session);
      if (!existing) throw BaseResponse.notFound({ err: 'Production not found' });

      if (existing.status !== ProductionEn.CREATE) {
        throw BaseResponse.invalid({ option: { message: 'Can only delete production in CREATE status' }, err: 'delete production not in create status' });
      }

      await this.global.deleteData(existing, session);
      return existing;
    }, sessionIn);
  }
}

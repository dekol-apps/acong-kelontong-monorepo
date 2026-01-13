import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { Accounting } from './accounting.schema';
import { Purchasing } from '../purchasing/purchasing.schema';

@Injectable()
export class AccountingService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Accounting.name) private accountingModel: Model<Accounting>,
    @InjectModel(Purchasing.name) private purchasingModel: Model<Purchasing>,
  ) { }

  async createAccountingItem(data: Accounting, sessionIn?: ClientSession): Promise<Accounting | undefined> {
    return this.global.withTransaction(async (session) => {
      const { order_type, order_id } = data;
      let orderData: any;
      switch (order_type) {
        case OrderType.PURCHASING: {
          orderData = await this.purchasingModel
            .findById(order_id)
            .session(session);

          if (!orderData) {
            throw BaseResponse.notFound({
              err: 'Purchasing order not found',
            });
          }
          break;
        }

        default:
          throw BaseResponse.invalid({
            err: `Unsupported order_type: ${order_type}`,
          });
      }
      const payload = {
        ...data,
        order_data: orderData,
      };
      const [created] = await this.accountingModel.create(
        [payload],
        { session },
      );

      if (!created) {
        throw BaseResponse.unexpected({
          err: 'Failed to create accounting item',
        });
      }
      return created;
    }, sessionIn);
  }
}
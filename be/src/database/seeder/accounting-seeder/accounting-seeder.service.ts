import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Accounting, AccountingDocument } from 'src/modules/accounting/accounting.schema';
import { FlowType, OrderType, PPnType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class AccountingSeederService {
  constructor(
    @InjectModel(Accounting.name) private readonly accountingModel: Model<AccountingDocument>,
  ) { }

  async run() {
    const existing = await this.accountingModel.findOne({
      order_type: OrderType.ADJUSTMENT,
      'order_data.seed_tag': 'SEED_ACCOUNTING',
    });

    if (existing) return;

    await this.accountingModel.create({
      flow_type: FlowType.IN,
      order_type: OrderType.ADJUSTMENT,
      order_id: new Types.ObjectId(),
      order_data: {
        seed_tag: 'SEED_ACCOUNTING',
        note: 'Dummy accounting adjustment record',
      },
      transaction_amount: toDecimal128(toDecimal(250000)),
      tax_base: toDecimal128(toDecimal(250000)),
      ppn_type: PPnType.NONE,
      ppn_rate: 0,
      ppn_amount: toDecimal128(toDecimal(0)),
      record_date: new Date(),
    });

    console.info('🚀 Seeded Accounting: adjustment dummy record');
  }
}

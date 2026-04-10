import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Accounting, AccountingDocument } from 'src/modules/accounting/accounting.schema';
import { Investment, InvestmentDocument } from 'src/modules/investment/investment.schema';
import { FlowType, InvestmentType, OrderType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class AccountingSeederService {
  constructor(
    @InjectModel(Accounting.name) private readonly accountingModel: Model<AccountingDocument>,
    @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
  ) { }

  async run() {
    const existing = await this.accountingModel.findOne({
      order_type: OrderType.DEPOSIT,
      'order_data.seed_tag': 'SEED_ACCOUNTING',
    });

    if (existing) return;

    const deposit = await this.investmentModel.create({
      investment_type: InvestmentType.DEPOSIT,
      transaction_amount: toDecimal128(toDecimal(25000000)),
      description: 'seeder deposit',
    });

    await this.accountingModel.create({
      flow_type: FlowType.IN,
      order_type: OrderType.DEPOSIT,
      order_id: new Types.ObjectId(),
      order_data: deposit,
      transaction_amount: toDecimal128(toDecimal(25000000)),
      record_date: new Date(),
    });

    console.info('🚀 Seeded Accounting: adjustment dummy record');
  }
}

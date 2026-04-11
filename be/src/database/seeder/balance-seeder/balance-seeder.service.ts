import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccountingBalance } from 'src/modules/accounting/accounting-balance.schema';
import { Accounting, AccountingDocument } from 'src/modules/accounting/accounting.schema';
import { Investment, InvestmentDocument } from 'src/modules/investment/investment.schema';
import { CurrencyEn, FlowType, InvestmentType, OrderType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

const INITIAL_BALANCE_SEED_DESCRIPTION = 'SEED_ACCOUNTING_INITIAL_BALANCE';

@Injectable()
export class BalanceSeederService {
  constructor(
    @InjectModel(Accounting.name) private readonly accountingModel: Model<AccountingDocument>,
    @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
    @InjectModel(AccountingBalance.name) private readonly balanceModel: Model<AccountingBalance>,
  ) { }

  async run() {
    // const existing = await this.accountingModel.findOne({
    //   order_type: OrderType.DEPOSIT,
    //   'order_data.description': INITIAL_BALANCE_SEED_DESCRIPTION,
    // });

    // if (existing) return;

    // const deposit = await this.investmentModel.create({
    //   investment_type: InvestmentType.DEPOSIT,
    //   transaction_amount: toDecimal128(toDecimal(25000000)),
    //   description: INITIAL_BALANCE_SEED_DESCRIPTION,
    // });

    // await this.accountingModel.create({
    //   flow_type: FlowType.IN,
    //   order_type: OrderType.DEPOSIT,
    //   order_id: deposit._id as Types.ObjectId,
    //   order_data: {
    //     ...deposit.toObject(),
    //     description: INITIAL_BALANCE_SEED_DESCRIPTION,
    //   },
    //   transaction_amount: toDecimal128(toDecimal(25000000)),
    //   record_date: new Date(),
    // });

    // console.info('🚀 Seeded Accounting: adjustment dummy record');
    
    const existingBalance = await this.balanceModel.findOne({ currency: CurrencyEn.IDR });
    if (existingBalance) return;
    await this.balanceModel.updateOne(
      { currency: CurrencyEn.IDR },
      { $setOnInsert: { amount: toDecimal128(toDecimal(0)) } },
      { upsert: true },
    );
    console.info(`🚀 Seeded account balance: ${CurrencyEn.IDR}`);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountingBalance } from 'src/modules/accounting/accounting-balance.schema';
import { Accounting, AccountingDocument } from 'src/modules/accounting/accounting.schema';
import { InvestmentService } from 'src/modules/investment/investment.service';
import { CurrencyEn, InvestmentType, OrderType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

const INITIAL_BALANCE_SEED_DESCRIPTION = 'SEED_ACCOUNTING_INITIAL_BALANCE';

@Injectable()
export class BalanceSeederService {
  constructor(
    @InjectModel(Accounting.name) private readonly accountingModel: Model<AccountingDocument>,
    @InjectModel(AccountingBalance.name) private readonly balanceModel: Model<AccountingBalance>,
    private readonly investmentService: InvestmentService,
  ) { }

  async run() {
    const existing = await this.accountingModel.findOne({
      order_type: OrderType.DEPOSIT,
      'order_data.description': INITIAL_BALANCE_SEED_DESCRIPTION,
    });

    if (existing) return;

    // Begin with defining balance of IDR in 0 if not exists
    await this.balanceModel.updateOne(
      { currency: CurrencyEn.IDR },
      { $setOnInsert: { currency: CurrencyEn.IDR, amount: toDecimal128(toDecimal(0)) } },
      { upsert: true },
    );
    console.info(`🚀 Seeded account balance: ${CurrencyEn.IDR}`);

    await this.investmentService.createInvestment({
      investment_type: InvestmentType.DEPOSIT,
      transaction_amount: toDecimal128(toDecimal(25000000)),
      description: INITIAL_BALANCE_SEED_DESCRIPTION,
    });

    console.info('🚀 Seeded initial balance: DEPOSIT 25,000,000 IDR');
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountingBalance } from 'src/modules/accounting/accounting-balance.schema';
import { CurrencyEn } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class BalanceSeederService {
  constructor(
    @InjectModel(AccountingBalance.name) private readonly balanceModel: Model<AccountingBalance>,
  ) { }

  async run() {
    await this.balanceModel.updateOne(
      { currency: CurrencyEn.IDR },
      { $setOnInsert: { amount: toDecimal128(toDecimal(0)) } },
      { upsert: true },
    );
    console.info(`🚀 Seeded account balance: ${CurrencyEn.IDR}`);
  }
}

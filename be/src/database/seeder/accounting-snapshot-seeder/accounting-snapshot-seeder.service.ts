import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountingSnapshot, AccountingSnapshotDocument } from 'src/modules/accounting/accounting-snapshot.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class AccountingSnapshotSeederService {
  constructor(
    @InjectModel(AccountingSnapshot.name) private readonly snapshotModel: Model<AccountingSnapshotDocument>,
  ) { }

  async run() {
    const existing = await this.snapshotModel.findOne();
    if (existing) return;

    await this.snapshotModel.create({
      balance: toDecimal128(toDecimal(1000000)),
      investment: toDecimal128(toDecimal(5000000)),
      total_assets: toDecimal128(toDecimal(6000000)),
      revenue: toDecimal128(toDecimal(2500000)),
      profit: toDecimal128(toDecimal(1200000)),
      cogs: toDecimal128(toDecimal(900000)),
      equity: toDecimal128(toDecimal(6000000)),
      snapshot_date: new Date(),
    });

    console.info('🚀 Seeded Accounting Snapshot');
  }
}

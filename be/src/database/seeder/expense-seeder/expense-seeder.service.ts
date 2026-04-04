import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument, ExpenseStatus } from 'src/modules/expense/expense.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class ExpenseSeederService {
    constructor(
        @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    ) { }

    async run() {
        const existing = await this.expenseModel.findOne({ subject: 'Electricity' });
        if (existing) return;

        await this.expenseModel.create({
            subject: 'Electricity',
            transaction_amount: toDecimal128(toDecimal(500000)),
            expense_date: new Date(),
            status: ExpenseStatus.COMPLETE,
            notes: 'Monthly electricity bill',
        });

        await this.expenseModel.create({
            subject: 'Internet',
            transaction_amount: toDecimal128(toDecimal(300000)),
            expense_date: new Date(),
            status: ExpenseStatus.COMPLETE,
            notes: 'Monthly internet subscription',
        });

        console.info('🚀 Seeded Expenses: Electricity, Internet');
    }
}

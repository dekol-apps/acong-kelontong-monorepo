import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Investment, InvestmentDocument } from 'src/modules/investment/investment.schema';
import { InvestmentType } from 'src/types/interfaces';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class InvestmentSeederService {
    constructor(
        @InjectModel(Investment.name) private readonly investmentModel: Model<InvestmentDocument>,
    ) { }

    async run() {
        const existing = await this.investmentModel.findOne({ description: 'Initial capital investment' });
        if (existing) return;

        await this.investmentModel.create({
            investment_type: InvestmentType.DEPOSIT,
            transaction_amount: toDecimal128(toDecimal(5000000)),
            description: 'Initial capital investment',
        });

        console.info('🚀 Seeded Investment: Initial capital');
    }
}

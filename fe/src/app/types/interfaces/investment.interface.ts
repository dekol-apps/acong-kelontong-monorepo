import { InvestmentType } from '../enums/common.enum';
export interface IInvestment {
  _id?: string,
  investment_type?: InvestmentType,
  transaction_amount?: { $numberDecimal: string },
  attachments?: string[],
  description?: string,
}
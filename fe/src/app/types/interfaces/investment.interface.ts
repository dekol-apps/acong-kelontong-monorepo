import { InvestmentType } from './common.interface';
export interface IInvestment {
  _id?: string,
  investment_type?: InvestmentType,
  transaction_amount?: { $numberDecimal: string },
  attachments?: string[],
  description?: string,
}
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { Investment } from './investment.schema';
import { FlowType, IListRes, InvestmentType, OrderType } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { InvestmentDto, ListInvestmentDTO } from './investment.dto';
import { AccountingService } from '../accounting/accounting.service';
import { Accounting } from '../accounting/accounting.schema';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

@Injectable()
export class InvestmentService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @Inject(forwardRef(() => AccountingService))
    private accounting: AccountingService,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
  ) { }

  async listInvestment({
    investment_type,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListInvestmentDTO): Promise<IListRes<Investment>> {
    const searchFields: string[] = ['transaction_amount', 'description'];
    const filter = { column: 'investment_type', value: investment_type };

    return this.global.getList<Investment>(
      this.investmentModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
        filter,
      }
    )
  }

  async createInvestment(dto: InvestmentDto, sessionIn?: ClientSession): Promise<Investment> {
    return this.global.withTransaction(async (session) => {
      const data = {
        investment_type: dto.investment_type,
        attachments: dto.attachments,
        description: dto.description,
        transaction_amount: toDecimal128(toDecimal(dto.transaction_amount))
      }
      const [newInvestment] = await this.investmentModel.create(
        [data],
        { session }
      );

      const accountingPayload: Accounting = {
        flow_type: data.investment_type === InvestmentType.DEPOSIT ? FlowType.IN : FlowType.OUT,
        order_id: newInvestment._id,
        order_data: newInvestment,
        order_type: data.investment_type === InvestmentType.DEPOSIT ? OrderType.DEPOSIT : OrderType.WITHDRAWAL,
        transaction_amount: toDecimal128(toDecimal(data.transaction_amount))
      }
      await this.accounting.createAccountingItem(accountingPayload, session)
      return newInvestment;
    }, sessionIn);
  }

  async detailInvestment(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Investment | undefined> {
    return this.global.withTransaction(async (session) => {
      const detail = await this.investmentModel
        .findById(id)
        .session(session)
        .lean()
        .exec();
      return detail || undefined
    }, sessionIn);
  }

  async editInvestment(
    id: Types.ObjectId,
    data: InvestmentDto,
    sessionIn?: ClientSession,
  ): Promise<{ investment: Investment; removedAttachments: string[] }> {
    return this.global.withTransaction(async (session) => {
      const investment = await this.investmentModel.findById(id).session(session);
      if (!investment) {
        throw BaseResponse.notFound({ err: 'Investment not found' });
      }

      const oldAttachments = investment.attachments ?? [];
      const newAttachments = data.attachments ?? oldAttachments;

      const removedAttachments = oldAttachments.filter(
        (url) => !newAttachments.includes(url),
      );

      const updated = await this.investmentModel.findOneAndUpdate(
        { _id: id, investment_type: data.investment_type },
        { $set: data },
        { new: true, runValidators: true, session },
      );

      if (!updated) {
        throw BaseResponse.notFound({ err: 'Updated investment not found, maksure do not confuse DEPOSIT and WITHDRAWAL' });
      }

      const accountingPayload: Accounting = {
        flow_type: data.investment_type === InvestmentType.DEPOSIT ? FlowType.IN : FlowType.OUT,
        order_id: id,
        order_data: updated,
        order_type: data.investment_type === InvestmentType.DEPOSIT ? OrderType.DEPOSIT : OrderType.WITHDRAWAL,
        transaction_amount: toDecimal128(toDecimal(data.transaction_amount))
      }
      await this.accounting.editAccountingItem(accountingPayload, session)

      return {
        investment: updated,
        removedAttachments,
      };
    }, sessionIn);
  }

}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { GlobalService } from 'src/global/global.service';
import { Investment } from './investment.schema';
import { IListRes } from 'src/types/interfaces';
import { BaseResponse } from 'src/utils/base-response';
import { InvestmentDto, ListInvestmentDTO } from './investment.dto';

@Injectable()
export class InvestmentService {

  constructor(
    @Inject(forwardRef(() => GlobalService))
    private global: GlobalService,
    @InjectModel(Investment.name) private investmentModel: Model<Investment>,
  ) { }

  async listInvestment({
    movement_type,
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: ListInvestmentDTO): Promise<IListRes<Investment>> {
    const searchFields: string[] = ['transaction_amount', 'description'];
    const filter = { column: 'movement_type', value: movement_type };

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

  async createInvestment(data: InvestmentDto): Promise<Investment> {
    try {
      const newInvestment = await this.investmentModel.create(data);
      return newInvestment;
    } catch (err) {
      throw BaseResponse.unexpected({ err: { text: 'createInvestment catch', err } })
    }
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

      const updated = await this.investmentModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true, session },
      );

      if (!updated) {
        throw BaseResponse.notFound({ err: 'Updated investment not found' });
      }

      return {
        investment: updated,
        removedAttachments,
      };
    }, sessionIn);
  }

}

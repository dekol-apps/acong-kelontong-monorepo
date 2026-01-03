import { Injectable } from '@nestjs/common';
import { Approval, ApprovalStatusEn } from './approval.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import { GlobalService } from 'src/global/global.service';
import { IPaginationRes } from 'src/types/interfaces';
import { PaginationDto } from 'src/global/global.dto';
import { PurchasingService } from '../purchasing/purchasing.service';
import { PurchasingEn } from '../purchasing/purchasing.schema';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectModel(Approval.name) private readonly approvalModel: Model<Approval>,
    private global: GlobalService,
    private purchasing: PurchasingService
  ) { }

  async listApproval({
    page,
    size,
    sortBy,
    sortDir,
    search,
  }: PaginationDto): Promise<{ data: Approval[]; meta: IPaginationRes }> {
    const searchFields: string[] = ['approval_name', 'approval_description'];

    return this.global.getList<Approval>(
      this.approvalModel,
      {
        page,
        size,
        sortBy,
        sortDir,
        search,
        searchFields,
      }
    )
  }

  async createApproval(data: Approval, sessionIn?: ClientSession): Promise<Approval> {
    return this.global.withTransaction(async (session) => {
      return (await this.approvalModel.create([data], { session }))[0];
    }, sessionIn)
  }

  async editApproval(id: Types.ObjectId, data: Approval, sessionIn?: ClientSession): Promise<Approval | undefined> {
    return this.global.withTransaction(async (session) => {
      const updatedItem = await this.approvalModel.findByIdAndUpdate(
        id,
        { $set: data },
        {
          new: true,
          runValidators: true,
        },
      ).session(session);
      return updatedItem || undefined;
    }, sessionIn)
  }

  async detailApproval(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Approval | undefined> {
    return this.global.withTransaction(async (session) => {
      const detailApproval = await this.approvalModel.findById(id).session(session);
      return detailApproval || undefined;
    }, sessionIn)
  }

  async deleteApproval(id: Types.ObjectId, sessionIn?: ClientSession): Promise<Approval | undefined> {
    return this.global.withTransaction(async (session) => {
      const data = await this.approvalModel.findById(id).session(session);
      if (!data) throw BaseResponse.notFound({ err: 'detailApproval failed', option: { message: 'Approval not found' } });
      const deleted = await this.global.deleteData(data, session);
      return deleted || undefined;
    }, sessionIn);
  }

  async approvalPurchasing(id: Types.ObjectId, notes?: string, sessionIn?: ClientSession): Promise<Approval | undefined> {
    return this.global.withTransaction(async (session) => {
      const data = await this.detailApproval(id, session);
      if (!data) throw BaseResponse.notFound({ err: 'Approval not found' });
      const status = data.approval_status === ApprovalStatusEn.APPROVE ? PurchasingEn.APPROVE : PurchasingEn.REJECT;
      data.approval_note = notes;
      await this.purchasing.purchasingUpdateStat(data.approval_data_id, status, notes, session)
      return await this.editApproval(id, data, session)
    }, sessionIn)
  }
}

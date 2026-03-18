import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { InvestmentDto, ListInvestmentDTO } from './investment.dto';
import { InvestmentService } from './investment.service';
import * as fs from 'fs';
import { AttachmentsInterceptor } from 'src/global/attachments-interceptor';
import { toDecimal, toDecimal128 } from 'src/utils/helper';

interface headerArgs {
  files?: Express.Multer.File[];
  req: Request;
  body?: InvestmentDto;
  res: Response;
}

@UseGuards(UAuthGuard)
@Controller('investment')
export class InvestmentController {

  constructor(
    private readonly service: InvestmentService,
  ) { }


  async investmentMutation<T>(
    args: headerArgs,
    cb: () => Promise<T>,
  ): Promise<T> {
    try {
      if (args.files?.length && args.body) {
        const existingAttachments = args.body.attachments?.filter(item => typeof item === 'string') ?? [];
        const newAttachments = args.files.map((file) => {
          const normalizedDestination = file.destination.replace(/\\/g, '/'); //JUST IN CASE server run on windows.
          return `${args.req.protocol}://${args.req.get('host')}/${normalizedDestination}/${file.filename}`;
        });
        args.body.attachments = [...existingAttachments, ...newAttachments]
      }

      return await cb();
    } catch (err) {
      if (args.files?.length) {
        const uploadPath = (args.req as any).uploadPath;
        const dirPath = `./uploads/${uploadPath}`;

        fs.rmSync(dirPath, { recursive: true, force: true });
      }

      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Permission(['investment.create'])
  @Post('')
  @AttachmentsInterceptor('attachments', 5)
  async createInvestment(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: InvestmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log('FILES:', files);
    return this.investmentMutation({ files, body, req, res }, async () => {
      const investment = await this.service.createInvestment(body);
      return BaseResponse.success({ res, option: { message: "Success create investment", detail: investment } });
    })
  }

  @Permission(['investment.edit'])
  @Put(':investment_id')
  @AttachmentsInterceptor('attachments', 5)
  async editInvestment(
    @Param('investment_id') investment_id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.investmentMutation({ files, body, req, res }, async () => {
      const data = {
        ...body,
        transaction_amount: toDecimal128(toDecimal(body.transaction_amount))
      }
      const id = new Types.ObjectId(investment_id);
      const { investment, removedAttachments } = await this.service.editInvestment(id, data);

      // delete old files AFTER DB success
      removedAttachments.forEach((url) => {
        try {
          const pathname = new URL(url).pathname;
          fs.rmSync(`.${pathname}`, { force: true });
        } catch (e) {
          console.warn('Failed to remove attachment:', url);
        }
      });

      return BaseResponse.success({
        res,
        option: {
          message: 'Success edit investment',
          detail: investment,
        },
      });
    });
  }

  @Permission(['investment.view'])
  @Get('')
  async listInvestment(
    @Query() query: ListInvestmentDTO,
    @Res() res: Response,
  ) {
    try {
      const { data, meta } = await this.service.listInvestment(query);
      return BaseResponse.success({ res, option: { message: 'Success get list inventory item', list: data, meta } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Permission(['investment.view'])
  @Get(':investment_id')
  async detailInvestment(
    @Param('investment_id') investmentId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const investment = await this.service.detailInvestment(investmentId);
      return BaseResponse.success({ res, option: { message: "Success get detail investment", detail: investment } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}



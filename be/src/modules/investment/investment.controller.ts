import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFiles } from '@nestjs/common';
import { Types } from 'mongoose';
import type { Request, Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { InvestmentDto, ListInvestmentDTO } from './investment.dto';
import { InvestmentService } from './investment.service';
import * as fs from 'fs';
import { InvestmentAttachmentsInterceptor } from './investment-attachments.interceptor';

interface headerArgs {
  files?: Express.Multer.File[];
  req: Request;
  dto?: InvestmentDto;
  res: Response;
}

@Controller('inventory-movement')
export class InvestmentController {

  constructor(
    private readonly service: InvestmentService,
  ) { }


  async investmentMutation<T>(
    args: headerArgs,
    cb: () => Promise<T>,
  ): Promise<T> {
    try {
      if (args.files?.length && args.dto) {
        const folder = (args.req as any).uuidFolder;
        const existingAttachments = args.dto.attachments?.filter(item => typeof item === 'string') ?? [];
        const newAttachements = args.files.map((file) => {
          const filePath = `/uploads/investment/${folder}/${file.originalname}`;
          return `${args.req.protocol}://${args.req.get('host')}${filePath}`;
        });
        args.dto.attachments = [...existingAttachments, ...newAttachements]
      }

      return await cb();
    } catch (err) {
      if (args.files?.length) {
        const folder = (args.req as any).uuidFolder;
        const dirPath = `./uploads/investment/${folder}`;

        fs.rmSync(dirPath, { recursive: true, force: true });
      }

      return BaseResponse.error({ res: args.res, err });
    }
  }

  @Post('')
  @InvestmentAttachmentsInterceptor()
  async createInvestment(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: InvestmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.investmentMutation({ files, dto, req, res }, async () => {
      const investment = await this.service.createInvestment(dto);
      return BaseResponse.success({ res, option: { message: "Success create investment", detail: investment } });
    })
  }

  @Put(':investment_id')
  @InvestmentAttachmentsInterceptor()
  async editInvestment(
    @Param('investment_id') id: Types.ObjectId,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: InvestmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.investmentMutation({ files, dto, req, res }, async () => {
      const { investment, removedAttachments } = await this.service.editInvestment(id, dto);

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



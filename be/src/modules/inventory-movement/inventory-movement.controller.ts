import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { Types } from 'mongoose';
import type { Response } from 'express';
import { BaseResponse } from 'src/utils/base-response';
import { InventoryMovementDto } from './inventory-movement.dto';
import { InventoryMovementService } from './inventory-movement.service';

@Controller('inventory-movement')
export class InventoryMovementController {

  constructor(
    private readonly service: InventoryMovementService,
  ) { }

  @Post('')
  async inventoryMovement(
    @Body() body: InventoryMovementDto,
    @Res() res: Response,
  ) {
    try {
      const inventoryMovement = await this.service.move(body);
      return BaseResponse.success({ res, option: { message: "Success create inventoryMovement", detail: inventoryMovement } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }

  @Get(':inventory_movement_id')
  async detailInventoryMovement(
    @Param('inventory_movement_id') inventoryMovementId: Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      const inventoryMovement = await this.service.detailInventoryMovement(inventoryMovementId);
      return BaseResponse.success({ res, option: { message: "Success get detail inventoryMovement", detail: inventoryMovement } });
    } catch (err) {
      return BaseResponse.error({ res, err });
    }
  }
}



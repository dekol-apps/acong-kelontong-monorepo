import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Permission } from 'src/global/permission.decoratior';
import { UAuthGuard } from '../auth/auth.guard';
import { ProductionService } from './production.service';
import { ProductionDto } from './production.dto';
import { PaginationDto } from 'src/global/global.dto';
import { Types } from 'mongoose';
import { ProductionEn } from './production.schema';

@UseGuards(UAuthGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Permission(['production.view'])
  @Get()
  async list(@Query() pagination: PaginationDto) {
    return this.productionService.list(pagination);
  }

  @Permission(['production.view'])
  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.productionService.detail(new Types.ObjectId(id));
  }

  @Permission(['production.create'])
  @Post()
  async create(@Body() dto: ProductionDto) {
    return this.productionService.create(dto);
  }

  @Permission(['production.edit'])
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ProductionDto) {
    return this.productionService.update(new Types.ObjectId(id), dto);
  }

  @Permission(['production.edit'])
  @Patch(':id/start')
  async start(@Param('id') id: string) {
    return this.productionService.start(new Types.ObjectId(id));
  }

  @Permission(['production.edit'])
  @Patch(':id/finish')
  async finish(@Param('id') id: string) {
    return this.productionService.finish(new Types.ObjectId(id));
  }

  @Permission(['production.delete'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.productionService.remove(new Types.ObjectId(id));
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingReceiveController } from './purchasing-receive.controller';

describe('PurchasingReceiveController', () => {
  let controller: PurchasingReceiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingReceiveController],
    }).compile();

    controller = module.get<PurchasingReceiveController>(PurchasingReceiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

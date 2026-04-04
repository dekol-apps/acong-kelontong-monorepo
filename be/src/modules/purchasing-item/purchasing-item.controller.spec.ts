import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingItemController } from './purchasing-item.controller';
import { PurchasingItemService } from './purchasing-item.service';

describe('PurchasingItemController', () => {
  let controller: PurchasingItemController;

  const mockPurchasingItemService = {
    createPurchasingItem: jest.fn(),
    editPurchasingItem: jest.fn(),
    detailPurchasingItem: jest.fn(),
    deletePurchasingItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingItemController],
      providers: [
        {
          provide: PurchasingItemService,
          useValue: mockPurchasingItemService,
        },
      ],
    }).compile();

    controller = module.get<PurchasingItemController>(PurchasingItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

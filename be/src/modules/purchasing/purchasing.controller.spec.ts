import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingController } from './purchasing.controller';
import { PurchasingService } from './purchasing.service';

describe('PurchasingController', () => {
  let controller: PurchasingController;

  const mockPurchasingService = {
    createPurchasing: jest.fn(),
    editPurchasing: jest.fn(),
    listPurchasing: jest.fn(),
    detailPurchasing: jest.fn(),
    deletePurchasing: jest.fn(),
    listPurchasingItems: jest.fn(),
    bulkUpdatePurchasingItems: jest.fn(),
    purchaseOrder: jest.fn(),
    purchasingApproval: jest.fn(),
    purchasingExecute: jest.fn(),
    purchasingPayment: jest.fn(),
    receiveOrder: jest.fn(),
    purchasingDrop: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingController],
      providers: [
        {
          provide: PurchasingService,
          useValue: mockPurchasingService,
        },
      ],
    }).compile();

    controller = module.get<PurchasingController>(PurchasingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

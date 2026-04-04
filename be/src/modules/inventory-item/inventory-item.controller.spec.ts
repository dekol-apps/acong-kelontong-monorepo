import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemController } from './inventory-item.controller';
import { InventoryItemService } from './inventory-item.service';

describe('InventoryItemController', () => {
  let controller: InventoryItemController;

  const mockInventoryItemService = {
    listInventoryItems: jest.fn(),
    createInventoryItem: jest.fn(),
    editInventoryItem: jest.fn(),
    detailInventoryItem: jest.fn(),
    deleteInventoryItem: jest.fn(),
    reconcile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryItemController],
      providers: [
        {
          provide: InventoryItemService,
          useValue: mockInventoryItemService,
        },
      ],
    }).compile();

    controller = module.get<InventoryItemController>(InventoryItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

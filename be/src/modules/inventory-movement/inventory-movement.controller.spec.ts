import { Test, TestingModule } from '@nestjs/testing';
import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovementService } from './inventory-movement.service';

describe('InventoryMovementController', () => {
  let controller: InventoryMovementController;

  const mockInventoryMovementService = {
    createInventoryMovement: jest.fn(),
    move: jest.fn(),
    listInventoryMovement: jest.fn(),
    detailInventoryMovement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryMovementController],
      providers: [
        {
          provide: InventoryMovementService,
          useValue: mockInventoryMovementService,
        },
      ],
    }).compile();

    controller = module.get<InventoryMovementController>(InventoryMovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

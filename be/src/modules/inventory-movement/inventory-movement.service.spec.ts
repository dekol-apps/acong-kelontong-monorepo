import { Test, TestingModule } from '@nestjs/testing';
import { InventoryMovementService } from './inventory-movement.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryItemService } from '../inventory-item/inventory-item.service';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { InventoryMovement } from './inventory-movement.schema';
import { Product } from '../product/product.schema';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getPPnAmount: jest.fn().mockReturnValue({ ppn: 0, base: 0 }),
    getList: jest.fn(),
  };

  const mockInventoryItemService = {
    createInventoryItem: jest.fn(),
    deleteInventoryItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryMovementService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: InventoryItemService,
          useValue: mockInventoryItemService,
        },
        {
          provide: getModelToken(InventoryItem.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(InventoryMovement.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

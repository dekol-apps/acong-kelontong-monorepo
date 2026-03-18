import { Test, TestingModule } from '@nestjs/testing';
import { InventoryItemService } from './inventory-item.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryReconcile } from './inventory-reconcile.schema';
import { InventoryItem } from './inventory-item.schema';
import { Product } from '../product/product.schema';

describe('InventoryItemService', () => {
  let service: InventoryItemService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryItemService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(InventoryReconcile.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(InventoryItem.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<InventoryItemService>(InventoryItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

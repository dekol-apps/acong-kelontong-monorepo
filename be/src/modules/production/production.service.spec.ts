import { Test, TestingModule } from '@nestjs/testing';
import { ProductionService } from './production.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { Production } from './production.schema';
import { Product } from '../product/product.schema';

describe('ProductionService', () => {
  let service: ProductionService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getList: jest.fn(),
    deleteData: jest.fn(),
  };

  const mockInventoryMovementService = {
    moveOutByProductAndQty: jest.fn(),
    move: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: InventoryMovementService,
          useValue: mockInventoryMovementService,
        },
        {
          provide: getModelToken(Production.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

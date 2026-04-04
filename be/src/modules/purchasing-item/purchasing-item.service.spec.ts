import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingItemService } from './purchasing-item.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { Purchasing } from '../purchasing/purchasing.schema';
import { PurchasingItem } from './purchasing-item.schema';
import { Product } from '../product/product.schema';

describe('PurchasingItemService', () => {
  let service: PurchasingItemService;

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
    deleteData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasingItemService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(Purchasing.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(PurchasingItem.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<PurchasingItemService>(PurchasingItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

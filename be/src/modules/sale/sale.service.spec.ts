import { Test, TestingModule } from '@nestjs/testing';
import { SaleService } from './sale.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { Sale } from './sale.schema';
import { SaleItem } from './sale-item.schema';
import { Product } from '../product/product.schema';
import { Brand } from '../brand/brand.schema';

describe('SaleService', () => {
  let service: SaleService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getList: jest.fn(),
    priceAfterDiscount: jest.fn(),
    getPPnAmount: jest.fn().mockReturnValue({ ppn: 0, base: 0 }),
  };

  const mockAccountingService = {
    createAccountingItem: jest.fn(),
  };

  const mockInventoryMovementService = {
    moveOutByProductAndQty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
        {
          provide: InventoryMovementService,
          useValue: mockInventoryMovementService,
        },
        {
          provide: getModelToken(Sale.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(SaleItem.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Brand.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SaleService>(SaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

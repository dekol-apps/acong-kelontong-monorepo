import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingService } from './purchasing.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from '../accounting/accounting.service';
import { InventoryMovementService } from '../inventory-movement/inventory-movement.service';
import { PurchasingItemService } from '../purchasing-item/purchasing-item.service';
import { Purchasing } from './purchasing.schema';
import { PurchasingItem } from '../purchasing-item/purchasing-item.schema';
import { Supplier } from '../supplier/supplier.schema';

describe('PurchasingService', () => {
  let service: PurchasingService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    updateMany: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
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
    getList: jest.fn(),
    deleteData: jest.fn(),
  };

  const mockAccountingService = {
    createAccountingItem: jest.fn(),
  };

  const mockInventoryMovementService = {
    move: jest.fn(),
  };

  const mockPurchasingItemService = {
    createPurchasingItem: jest.fn(),
    editPurchasingItem: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasingService,
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
          provide: PurchasingItemService,
          useValue: mockPurchasingItemService,
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
          provide: getModelToken(Supplier.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<PurchasingService>(PurchasingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

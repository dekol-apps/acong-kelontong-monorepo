import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from './accounting.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { InventoryItem } from '../inventory-item/inventory-item.schema';
import { Accounting } from './accounting.schema';
import { AccountingBalance } from './accounting-balance.schema';
import { AccountingSnapshot } from './accounting-snapshot.schema';

describe('AccountingService', () => {
  let service: AccountingService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getList: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(InventoryItem.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Accounting.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(AccountingBalance.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(AccountingSnapshot.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

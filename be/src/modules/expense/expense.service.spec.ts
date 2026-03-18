import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from '../accounting/accounting.service';
import { Expense } from './expense.schema';

describe('ExpenseService', () => {
  let service: ExpenseService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getPphAmount: jest.fn(),
    getList: jest.fn(),
    deleteData: jest.fn(),
  };

  const mockAccountingService = {
    createAccountingItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
        {
          provide: getModelToken(Expense.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { AccountingService } from '../accounting/accounting.service';
import { Investment } from './investment.schema';

describe('InvestmentService', () => {
  let service: InvestmentService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    withTransaction: jest.fn((cb) => cb('mock-session')),
    getList: jest.fn(),
  };

  const mockAccountingService = {
    createAccountingItem: jest.fn(),
    correctAccountingItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
        {
          provide: getModelToken(Investment.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<InvestmentService>(InvestmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

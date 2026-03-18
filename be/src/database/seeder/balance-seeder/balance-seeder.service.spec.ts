import { Test, TestingModule } from '@nestjs/testing';
import { BalanceSeederService } from './balance-seeder.service';
import { getModelToken } from '@nestjs/mongoose';
import { AccountingBalance } from 'src/modules/accounting/accounting-balance.schema';

describe('BalanceSeederService', () => {
  let service: BalanceSeederService;

  const mockModel = {
    updateOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceSeederService,
        {
          provide: getModelToken(AccountingBalance.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<BalanceSeederService>(BalanceSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

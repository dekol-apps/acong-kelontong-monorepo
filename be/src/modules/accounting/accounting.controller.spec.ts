import { Test, TestingModule } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { UAuthGuard } from '../auth/auth.guard';

describe('AccountingController', () => {
  let controller: AccountingController;

  const mockAccountingService = {
    getPortofolio: jest.fn(),
    listTaxTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingController],
      providers: [
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
      ],
    })
      .overrideGuard(UAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccountingController>(AccountingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

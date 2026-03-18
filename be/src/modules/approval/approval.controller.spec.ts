import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalController } from './approval.controller';
import { PurchasingService } from '../purchasing/purchasing.service';
import { ExpenseService } from '../expense/expense.service';
import { UAuthGuard } from '../auth/auth.guard';

describe('ApprovalController', () => {
  let controller: ApprovalController;

  const mockPurchasingService = {
    listPurchasing: jest.fn(),
    purchasingApproval: jest.fn(),
  };

  const mockExpenseService = {
    listExpense: jest.fn(),
    expenseApproval: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovalController],
      providers: [
        {
          provide: PurchasingService,
          useValue: mockPurchasingService,
        },
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    })
      .overrideGuard(UAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ApprovalController>(ApprovalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

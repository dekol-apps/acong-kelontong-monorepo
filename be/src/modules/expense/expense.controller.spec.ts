import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

describe('ExpenseController', () => {
  let controller: ExpenseController;

  const mockExpenseService = {
    createExpense: jest.fn(),
    editExpense: jest.fn(),
    listExpense: jest.fn(),
    detailExpense: jest.fn(),
    deleteExpense: jest.fn(),
    expenseRequest: jest.fn(),
    expenseApproval: jest.fn(),
    expenseExecute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

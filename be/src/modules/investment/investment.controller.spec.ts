import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

describe('InvestmentController', () => {
  let controller: InvestmentController;

  const mockInvestmentService = {
    listInvestment: jest.fn(),
    createInvestment: jest.fn(),
    detailInvestment: jest.fn(),
    editInvestment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentController],
      providers: [
        {
          provide: InvestmentService,
          useValue: mockInvestmentService,
        },
      ],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

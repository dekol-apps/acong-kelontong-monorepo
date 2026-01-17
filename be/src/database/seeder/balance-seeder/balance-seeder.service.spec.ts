import { Test, TestingModule } from '@nestjs/testing';
import { BalanceSeederService } from './balance-seeder.service';

describe('BalanceSeederService', () => {
  let service: BalanceSeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalanceSeederService],
    }).compile();

    service = module.get<BalanceSeederService>(BalanceSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

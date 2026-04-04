import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from './seeder.service';
import { UserSeederService } from './user-seeder/user-seeder.service';
import { ProductSeederService } from './product-seeder/product-seeder.service';
import { SupplierSeederService } from './supplier-seeder/supplier-seeder.service';
import { BalanceSeederService } from './balance-seeder/balance-seeder.service';

describe('SeederService', () => {
  let service: SeederService;

  const mockUserSeeder = { run: jest.fn() };
  const mockProductSeeder = { run: jest.fn() };
  const mockSupplierSeeder = { run: jest.fn() };
  const mockBalanceSeeder = { run: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        { provide: UserSeederService, useValue: mockUserSeeder },
        { provide: ProductSeederService, useValue: mockProductSeeder },
        { provide: SupplierSeederService, useValue: mockSupplierSeeder },
        { provide: BalanceSeederService, useValue: mockBalanceSeeder },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

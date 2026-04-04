import { Test, TestingModule } from '@nestjs/testing';
import { SupplierSeederService } from './supplier-seeder.service';
import { getModelToken } from '@nestjs/mongoose';
import { Supplier } from 'src/modules/supplier/supplier.schema';

describe('SupplierSeederService', () => {
  let service: SupplierSeederService;

  const mockSupplierModel = {
    updateOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierSeederService,
        {
          provide: getModelToken(Supplier.name),
          useValue: mockSupplierModel,
        },
      ],
    }).compile();

    service = module.get<SupplierSeederService>(SupplierSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

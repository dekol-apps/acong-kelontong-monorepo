import { Test, TestingModule } from '@nestjs/testing';
import { ProductSeederService } from './product-seeder.service';
import { getModelToken } from '@nestjs/mongoose';
import { Brand } from 'src/modules/brand/brand.schema';
import { Product } from 'src/modules/product/product.schema';

describe('ProductSeederService', () => {
  let service: ProductSeederService;

  const mockBrandModel = {
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockProductModel = {
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSeederService,
        {
          provide: getModelToken(Brand.name),
          useValue: mockBrandModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductSeederService>(ProductSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

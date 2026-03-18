import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from './brand.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { Brand } from './brand.schema';

describe('BrandService', () => {
  let service: BrandService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockGlobalService = {
    getList: jest.fn(),
    deleteData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(Brand.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

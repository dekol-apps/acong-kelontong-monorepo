import { Test, TestingModule } from '@nestjs/testing';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

describe('BrandController', () => {
  let controller: BrandController;

  const mockBrandService = {
    listBrand: jest.fn(),
    createBrand: jest.fn(),
    editBrand: jest.fn(),
    detailBrand: jest.fn(),
    deleteBrand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [
        {
          provide: BrandService,
          useValue: mockBrandService,
        },
      ],
    }).compile();

    controller = module.get<BrandController>(BrandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

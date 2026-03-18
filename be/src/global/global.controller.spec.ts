import { Test, TestingModule } from '@nestjs/testing';
import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';
import { UAuthGuard } from '../modules/auth/auth.guard';

describe('GlobalController', () => {
  let controller: GlobalController;

  const mockGlobalService = {
    getPermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalController],
      providers: [
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
      ],
    })
      .overrideGuard(UAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GlobalController>(GlobalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

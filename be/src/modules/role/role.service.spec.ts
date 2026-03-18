import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { Role } from './role.schema';

describe('RoleService', () => {
  let service: RoleService;

  const mockRoleModel = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
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
        RoleService,
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { GlobalService } from 'src/global/global.service';
import { RoleService } from '../role/role.service';
import { User } from './user.schema';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel = {
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    updateMany: jest.fn().mockReturnThis(),
    exists: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleService = {
    getDetailRole: jest.fn(),
  };

  const mockGlobalService = {
    getList: jest.fn(),
    deleteData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: GlobalService,
          useValue: mockGlobalService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

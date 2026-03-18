import { Test, TestingModule } from '@nestjs/testing';
import { UserSeederService } from './user-seeder.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/modules/user/user.schema';
import { Role } from 'src/modules/role/role.schema';

describe('UserSeederService', () => {
  let service: UserSeederService;

  const mockUserModel = {
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockRoleModel = {
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSeederService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<UserSeederService>(UserSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UAuthGuard } from '../auth/auth.guard';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getListUser: jest.fn(),
    inviteUser: jest.fn(),
    getDetailUser: jest.fn(),
    deleteUser: jest.fn(),
    resendVerification: jest.fn(),
    editUser: jest.fn(),
    editUsrPasswd: jest.fn(),
    editUsrEmailReq: jest.fn(),
    editUsrEmailConfirm: jest.fn(),
    verifyUser: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    })
      .overrideGuard(UAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

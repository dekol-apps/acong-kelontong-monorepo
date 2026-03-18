import { Test, TestingModule } from '@nestjs/testing';
import { GlobalService } from './global.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Trash } from './global.schema';

describe('GlobalService', () => {
  let service: GlobalService;

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    updateOne: jest.fn().mockReturnThis(),
    session: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockReturnValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalService,
        {
          provide: getModelToken(Trash.name),
          useValue: mockModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<GlobalService>(GlobalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

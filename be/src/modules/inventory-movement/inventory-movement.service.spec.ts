import { Test, TestingModule } from '@nestjs/testing';
import { InventoryMovementService } from './inventory-movement.service';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryMovementService],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

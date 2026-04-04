import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingService } from './modules/purchasing/purchasing.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { GlobalService } from './global/global.service';
import { AccountingService } from './modules/accounting/accounting.service';
import { InventoryMovementService } from './modules/inventory-movement/inventory-movement.service';
import { PurchasingItemService } from './modules/purchasing-item/purchasing-item.service';
import { Purchasing, PurchasingEn } from './modules/purchasing/purchasing.schema';
import { PurchasingItem } from './modules/purchasing-item/purchasing-item.schema';
import { Supplier } from './modules/supplier/supplier.schema';
import { Types } from 'mongoose';

// Mocking the dependencies
const mockModel = {
  findById: jest.fn(),
};

const mockGlobalService = {
  withTransaction: jest.fn((cb) => cb('mock-session')),
  existsByOrderId: jest.fn(),
};

const mockAccountingService = {
  existsByOrderId: jest.fn(),
  checkSnapshot: jest.fn().mockResolvedValue(false),
};

const mockConnection = {
  startSession: jest.fn(),
};

describe('PurchasingService Verification', () => {
  let service: PurchasingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasingService,
        { provide: GlobalService, useValue: mockGlobalService },
        { provide: AccountingService, useValue: mockAccountingService },
        { provide: InventoryMovementService, useValue: {} },
        { provide: PurchasingItemService, useValue: {} },
        { provide: getModelToken(Purchasing.name), useValue: mockModel },
        { provide: getModelToken(PurchasingItem.name), useValue: {} },
        { provide: getModelToken(Supplier.name), useValue: mockModel },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<PurchasingService>(PurchasingService);
  });

  it('editPurchasing should NOT lookup supplier if data.supplier is missing', async () => {
    const purchaseId = new Types.ObjectId();
    const existingSupplierId = new Types.ObjectId();
    const existingPurchase = {
      _id: purchaseId,
      supplier: existingSupplierId,
      status: PurchasingEn.APPROVE,
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnThis(),
    };

    mockModel.findById.mockImplementation((id) => {
      if (id.toString() === purchaseId.toString()) return { session: () => existingPurchase };
      return { session: () => null };
    });

    jest.spyOn(service, 'detailPurchasing').mockResolvedValue({} as any);

    const result = await service.editPurchasing(purchaseId, { 
      notes: 'Some notes' 
    } as any);

    expect(result).toBeDefined();
    expect(existingPurchase.save).toHaveBeenCalled();
    // Should only be called ONCE (for the purchase itself)
    expect(mockModel.findById).toHaveBeenCalledTimes(1);
    expect(mockModel.findById).toHaveBeenCalledWith(purchaseId);
  });

  it('editPurchasing SHOULD lookup supplier if data.supplier is provided', async () => {
    const purchaseId = new Types.ObjectId();
    const newSupplierId = new Types.ObjectId();
    const existingPurchase = {
      _id: purchaseId,
      supplier: new Types.ObjectId(),
      status: PurchasingEn.CREATE,
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnThis(),
    };

    mockModel.findById.mockReset();
    mockModel.findById.mockImplementation((id) => {
      if (id.toString() === purchaseId.toString()) return { session: () => existingPurchase };
      if (id.toString() === newSupplierId.toString()) return { session: () => ({ _id: newSupplierId, supplier_name: 'New Supplier' }) };
      return { session: () => null };
    });

    await service.editPurchasing(purchaseId, { 
      supplier: newSupplierId,
      notes: 'Updating supplier'
    } as any);

    // Should be called TWICE
    expect(mockModel.findById).toHaveBeenCalledTimes(2);
    expect(mockModel.findById).toHaveBeenCalledWith(newSupplierId);
  });
});

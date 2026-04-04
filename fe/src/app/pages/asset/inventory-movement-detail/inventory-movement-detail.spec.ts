import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovementDetail } from './inventory-movement-detail';

describe('InventoryMovementDetail', () => {
  let component: InventoryMovementDetail;
  let fixture: ComponentFixture<InventoryMovementDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryMovementDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryMovementDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

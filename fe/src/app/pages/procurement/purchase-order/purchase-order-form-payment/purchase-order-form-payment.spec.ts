import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderFormPayment } from './purchase-order-form-payment';

describe('PurchaseOrderFormPayment', () => {
  let component: PurchaseOrderFormPayment;
  let fixture: ComponentFixture<PurchaseOrderFormPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderFormPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

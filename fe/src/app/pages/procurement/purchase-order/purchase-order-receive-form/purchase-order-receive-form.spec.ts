import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderReceiveForm } from './purchase-order-receive-form';

describe('PurchaseOrderReceiveForm', () => {
  let component: PurchaseOrderReceiveForm;
  let fixture: ComponentFixture<PurchaseOrderReceiveForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderReceiveForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderReceiveForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

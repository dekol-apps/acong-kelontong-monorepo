import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveOrderForm } from './receive-order-form';

describe('ReceiveOrderForm', () => {
  let component: ReceiveOrderForm;
  let fixture: ComponentFixture<ReceiveOrderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiveOrderForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiveOrderForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

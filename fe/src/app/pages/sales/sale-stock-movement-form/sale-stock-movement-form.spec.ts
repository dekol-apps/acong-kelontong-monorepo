import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleStockMovementForm } from './sale-stock-movement-form';

describe('SaleStockMovementForm', () => {
  let component: SaleStockMovementForm;
  let fixture: ComponentFixture<SaleStockMovementForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleStockMovementForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleStockMovementForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionForm } from './production-form';

describe('ProductionForm', () => {
  let component: ProductionForm;
  let fixture: ComponentFixture<ProductionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

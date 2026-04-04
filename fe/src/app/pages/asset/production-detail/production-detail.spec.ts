import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionDetail } from './production-detail';

describe('ProductionDetail', () => {
  let component: ProductionDetail;
  let fixture: ComponentFixture<ProductionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

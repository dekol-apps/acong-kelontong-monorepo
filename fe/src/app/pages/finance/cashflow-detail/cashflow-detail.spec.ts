import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashflowDetail } from './cashflow-detail';

describe('CashflowDetail', () => {
  let component: CashflowDetail;
  let fixture: ComponentFixture<CashflowDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashflowDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashflowDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

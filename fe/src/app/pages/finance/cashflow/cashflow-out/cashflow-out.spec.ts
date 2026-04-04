import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashflowOut } from './cashflow-out';

describe('CashflowOut', () => {
  let component: CashflowOut;
  let fixture: ComponentFixture<CashflowOut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashflowOut]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashflowOut);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

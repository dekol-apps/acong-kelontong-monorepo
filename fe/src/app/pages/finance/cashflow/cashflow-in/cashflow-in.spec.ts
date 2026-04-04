import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashflowIn } from './cashflow-in';

describe('CashflowIn', () => {
  let component: CashflowIn;
  let fixture: ComponentFixture<CashflowIn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashflowIn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashflowIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

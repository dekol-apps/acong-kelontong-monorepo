import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalExpenses } from './approval-expenses';

describe('ApprovalExpenses', () => {
  let component: ApprovalExpenses;
  let fixture: ComponentFixture<ApprovalExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalExpenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalExpenses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

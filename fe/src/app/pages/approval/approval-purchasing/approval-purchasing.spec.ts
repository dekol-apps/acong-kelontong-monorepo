import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalPurchasing } from './approval-purchasing';

describe('ApprovalPurchasing', () => {
  let component: ApprovalPurchasing;
  let fixture: ComponentFixture<ApprovalPurchasing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalPurchasing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalPurchasing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

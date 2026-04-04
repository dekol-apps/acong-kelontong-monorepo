import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesHistoryDetail } from './sales-history-detail';

describe('SalesHistoryDetail', () => {
  let component: SalesHistoryDetail;
  let fixture: ComponentFixture<SalesHistoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesHistoryDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesHistoryDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

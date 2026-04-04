import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Approval } from './approval';

describe('Approval', () => {
  let component: Approval;
  let fixture: ComponentFixture<Approval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Approval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Approval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragDropFileMulti } from './drag-drop-file-multi';

describe('DragDropFileMulti', () => {
  let component: DragDropFileMulti;
  let fixture: ComponentFixture<DragDropFileMulti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragDropFileMulti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragDropFileMulti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

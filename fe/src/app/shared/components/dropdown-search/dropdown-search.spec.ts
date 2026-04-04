import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearch } from './dropdown-search';

describe('DropdownSearch', () => {
  let component: DropdownSearch;
  let fixture: ComponentFixture<DropdownSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

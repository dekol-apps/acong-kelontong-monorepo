import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ISelectValue } from '../../../types/interfaces/common.interface';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dropdown-search',
  imports: [NgbDropdownModule, TranslateModule],
  standalone: true,
  templateUrl: './dropdown-search.html',
  styleUrl: './dropdown-search.scss',
})
export class DropdownSearch implements OnInit, OnDestroy {

  @Input() invalid?: boolean;
  @Input() isLoading?: boolean;
  @Input() value: string = '';
  @Input() items: ISelectValue[] = [];
  @Input() placeholder: string = 'Select Item';
  @Input() searchPlaceholder: string = 'Search Item';
  @Input() searchLabel: string = 'label';
  @Output() onSelect = new EventEmitter<any>();
  @Output() onSearch = new EventEmitter<string>();

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500; // Set the debounce time (in milliseconds)

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged()
      ).subscribe((searchValue) => {
        this.onSearch.emit(searchValue);
      });
  }

  ngOnDestroy() {
    //destroy searc1 subscribe
    this.searchSubject.complete();
  }

  filterItems(event: any): void {
    const query = event.target.value.toLowerCase();
    this.searchSubject.next(query);
    this.items = this.items.filter(p =>
      p.label.toLowerCase().includes(query)
    );
  }

  selectItem(value: any): void {
    this.onSelect.emit(value);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import {
  ISelectFilter,
  ISelectValue,
} from '../../../types/interfaces/common.interface';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-select-filter',
  imports: [NgbDropdownModule, CommonModule, TranslateModule],
  templateUrl: './select-filter.html',
})
export class SelectFilter {
  defaultTitle: string = 'Select filter';
  @Input() filterSelect?: ISelectFilter;
  @Output() OnChangeFilter: EventEmitter<ISelectValue> = new EventEmitter<ISelectValue>();

  select(option: ISelectValue) {
    this.filterSelect!['value'] = option;
    this.OnChangeFilter.emit(option);
  }

  reset() {
    this.filterSelect!['value'] = undefined;
    this.OnChangeFilter.emit(undefined);
  }
}

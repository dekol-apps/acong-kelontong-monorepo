import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TableColumn } from '../../directives/table-column/table-column';
import { IDateRangeFilter, IPaginationOutput, ISelectFilter, ISelectValue, ISort, TSortDir } from '../../../types/interfaces/common.interface';
import { getNestedProperty } from '../../../utils/helper';
import { CURRENCY_FORMAT, DATE_FORMAT, SORT_DIR } from '../../../types/constants/common.constants';
import { FormsModule } from '@angular/forms';
import { SelectFilter } from '../select-filter/select-filter';
import { DateRangeFilter } from '../date-range-filter/date-range-filter';
import { Pagination } from '../pagination/pagination';
import { SortIcon } from './sort-icon/sort-icon';

export interface ColumnProps {
  id: string;
  backendPropName?: string;
  label: string;
  sort?: boolean;
  customElementId?: string; // Element ID for dynamic HTML content
  extraHeaderClass?: string;
  dataType?: 'CURRENCY' | 'DATE';
}

export interface ITableQueryData extends ISort, IPaginationOutput {
  search?: string,
  filterByDateVal?: IDateRangeFilter,
  filterSelectVal?: ISelectValue,
}

export const defaultComonQueryData = {
  page: 1, size: 10, search: '', sortBy: '', sortDir: SORT_DIR.NONE
};

@Component({
  selector: 'app-generic-table',
  imports: [CommonModule, FormsModule, SelectFilter, DateRangeFilter, Pagination, SortIcon],
  templateUrl: './generic-table.html',
  styleUrl: './generic-table.scss'
})
export class GenericTable implements OnInit, OnDestroy {
  DATE_FORMAT = DATE_FORMAT;
  CURRENCY_FORMAT = CURRENCY_FORMAT;

  // trackByFn = trackByFn;
  @Input() columns: Array<ColumnProps> = [];
  @Input() data: any[] = [];
  @Input() total: number = 0;
  //turn on / off function
  @Input() useSearch: boolean = false;
  @Input() useFilterByDate: boolean = false;

  @Input() filterSelect?: ISelectFilter;
  @Input() filterSelectVal?: ISelectValue;

  @Input() filterByDateDefaultValue?: IDateRangeFilter;
  @Input() usePagination: boolean = true;
  @Input() useDownloadButton: boolean = false;
  @Input() useCustomToolbar: boolean = false;
  @Input() useCheckbox: boolean = false;
  // for pagination
  @Input() size: number = 10;
  @Input() page: number = 1;
  // for sorting & search
  @Input() searchPlaceholder: string = '';
  @Input() search: string = '';
  @Input() sortBy: string = '';
  @Input() sortDir: SORT_DIR = SORT_DIR.NONE;
  @Input() isLoading: boolean = false;

  @Output() OnDataRefresh: EventEmitter<ITableQueryData> = new EventEmitter<ITableQueryData>();
  @Output() DownloadButtonClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() OnCheckboxChange: EventEmitter<any> = new EventEmitter<any>();

  //for costum column
  @ContentChildren(TableColumn)
  columnDefinitions: QueryList<TableColumn> = {} as QueryList<TableColumn>; // This contains elements with appTableColumn directive, needed for custom column

  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 500; // Set the debounce time (in milliseconds)

  public get columnTemplates(): { [key: string]: TemplateRef<any> } {
    if (this.columnDefinitions != null) {
      const columnTemplates: { [key: string]: TemplateRef<any> } = {};
      for (const columnDefinition of this.columnDefinitions.toArray()) {
        columnTemplates[columnDefinition.customColumnId] =
          columnDefinition.columnTemplate;
      }
      return columnTemplates;
    } else {
      return {};
    }
  }

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged()
      ).subscribe((searchValue) => {
        this.search = searchValue;
        this.page = 1;
        this.refreshData();
      });
  }

  ngOnDestroy() {
    //destroy searc1 subscribe
    this.searchSubject.complete();
  }

  onSearch() {
    this.searchSubject.next(this.search);
  }

  changePage(paginationData: IPaginationOutput) {
    this.size = paginationData.size;
    this.page = paginationData.page;
    this.refreshData();
  }

  downloadButtonClicked() {
    this.DownloadButtonClicked.emit();
  } 1
  getRowDataValue(rowData: any, nestedPropertyName: string): any {
    return getNestedProperty(rowData, nestedPropertyName);
  }

  getColumnById(columnId: string): ColumnProps | undefined {
    return this.columns.find(c => c.id === columnId);
  }

  sortChanged(columnId: string): void {
    if (columnId === this.sortBy) {
      this.sortDir = this.sortDir === SORT_DIR.ASC ? SORT_DIR.DESC : SORT_DIR.ASC;
    } else {
      this.sortDir = SORT_DIR.ASC;
    }
    this.sortBy = columnId;
    this.refreshData();
  }

  filterByDateChanged(evt: IDateRangeFilter) {
    this.page = 1;
    this.filterByDateDefaultValue = evt;
    this.refreshData();
  }

  filterSelectChange(evt: ISelectValue) {
    this.page = 1;
    this.filterSelectVal = evt
    this.refreshData();
  }

  refreshData() {
    console.log('refreshData qData', this.queryData)
    this.OnDataRefresh.emit(this.queryData);
  }

  public backToFirstPage() {
    this.page = 1;
  }

  get queryData(): ITableQueryData {
    const qData = {
      page: this.page ?? 1,
      size: this.size ?? 10,
      filterByDateVal: this.filterByDateDefaultValue,
      filterSelectVal: this.filterSelectVal,
      search: this.search ?? '',
      sortBy: this.getColumnById(this.sortBy)?.backendPropName ?? this.sortBy ?? '',
      sortDir: this.sortDir ?? SORT_DIR.NONE
    };
    return qData;
  }

  checkBoxVal: any[] = [];

  isChecked(evt: any): boolean {
    let val = false;
    const parameter = JSON.stringify(evt);
    this.checkBoxVal.forEach((item) => {
      const copyData = JSON.stringify(item);
      if (copyData === parameter) {
        val = true
      }
    })
    return val;
  }

  onChecked(evt: any) {
    if (this.isChecked(evt)) {
      this.checkBoxVal = this.checkBoxVal.filter(el => JSON.stringify(el) !== JSON.stringify(evt));
      this.trigerCheckboxChange();
    } else {
      this.checkBoxVal.push(evt);
      this.trigerCheckboxChange();
    }
  }

  isCheckedAll() {
    let checkeds = 0;
    this.data.forEach(el => {
      if (this.isChecked(el)) {
        checkeds += 1;
      }
    })
    return checkeds === this.data.length;
  }

  onCheckedAll(evt: any) {
    if (evt.target.checked) {
      this.data.forEach(el => {
        if (!this.isChecked(el)) {
          this.checkBoxVal.push(el);
        };
      });
      this.trigerCheckboxChange();
    } else {
      this.data.forEach((item) => {
        this.checkBoxVal.forEach((el, index) => {
          if (JSON.stringify(item) === JSON.stringify(el)) {
            this.checkBoxVal.splice(index, 1)
          }
        })
      });
      this.trigerCheckboxChange();
    }
  }

  trigerCheckboxChange() {
    const copyValue = JSON.parse(JSON.stringify(this.checkBoxVal));
    const newVal: any[] = [];
    copyValue.forEach((el: any) => {
      newVal.push(el);
    })
    this.OnCheckboxChange.emit(newVal);
  }
}

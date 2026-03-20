import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IDateRangeFilter } from '../../../types/interfaces/common.interface';

export function ngbToNativeDate(ngbDate: NgbDate | null): Date | undefined {
  if (!ngbDate) return undefined;
  return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
}

export function nativeToNgbDate(date?: Date): NgbDate | null {
  if (!date) return null
  if (typeof date !== typeof Date) date = new Date(date)
  return new NgbDate(
    date.getFullYear(),
    date.getMonth() + 1, // NgbDate months are 1-based (January is 1), while Date months are 0-based (January is 0)
    date.getDate()
  );
}
@Component({
  selector: 'app-date-range-filter',
  imports: [ReactiveFormsModule, NgbDatepickerModule, FormsModule],
  templateUrl: './date-range-filter.html',
  styleUrl: './date-range-filter.scss'
})
export class DateRangeFilter implements OnChanges {
  @Input() defaultVal?: IDateRangeFilter;
  @Output() OnDateChange: EventEmitter<IDateRangeFilter> = new EventEmitter<IDateRangeFilter>();
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = this.calendar.getToday();
  toDate: NgbDate | null = this.calendar.getNext(this.calendar.getToday(), 'd', 10);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultVal']) {
      if (this.defaultVal) {
        const startDate = nativeToNgbDate(this.defaultVal.start_date)
        const endDate = nativeToNgbDate(this.defaultVal.end_date)
        if (JSON.stringify(startDate) !== JSON.stringify(this.fromDate)) {
          this.onDateSelection(startDate);
        }
        if (JSON.stringify(endDate) !== JSON.stringify(this.toDate)) {
          this.onDateSelection(endDate);
        }
      }
    }
  }

  onDateSelection(date: NgbDate | null) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate && this.toDate) {
      this.OnDateChange.emit({ start_date: ngbToNativeDate(this.fromDate), end_date: ngbToNativeDate(this.toDate) })
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
}

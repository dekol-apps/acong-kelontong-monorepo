import { formatCurrency } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupiah',
  standalone: true,
})
export class RupiahPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private readonly locale: string) {}

  transform(value: number | string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(parsed)) {
      return null;
    }

    return formatCurrency(parsed, this.locale, 'Rp', 'IDR', '1.2-2');
  }
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DATE_FORMAT, CURRENCY_FORMAT } from '../../../types/constants/common.constants';

@Component({
  selector: 'app-shared-inventory-item-detail',
  imports: [CurrencyPipe, DatePipe],
  standalone: true,
  templateUrl: './shared-inventory-item-detail.html',
  styleUrl: './shared-inventory-item-detail.scss',
})
export class SharedInventoryItemDetail {
  @Input() detail?: any;
  @Input() titlePrefix: string = 'Inventory Item Detail';
  @Output() onBack = new EventEmitter<void>();

  DATE_FORMAT = DATE_FORMAT;
  CURRENCY_FORMAT = CURRENCY_FORMAT;

  back() {
    this.onBack.emit();
  }
}

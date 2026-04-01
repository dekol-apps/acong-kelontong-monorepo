import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DATE_FORMAT } from '../../../types/constants/common.constants';
import { RupiahPipe } from '../../../shared/pipes/rupiah.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-inventory-item-detail',
  imports: [DatePipe, RupiahPipe, TranslateModule],
  standalone: true,
  templateUrl: './shared-inventory-item-detail.html',
  styleUrl: './shared-inventory-item-detail.scss',
})
export class SharedInventoryItemDetail {
  @Input() detail?: any;
  @Input() titlePrefix: string = 'Inventory Item Detail';
  @Output() onBack = new EventEmitter<void>();

  DATE_FORMAT = DATE_FORMAT;

  back() {
    this.onBack.emit();
  }
}

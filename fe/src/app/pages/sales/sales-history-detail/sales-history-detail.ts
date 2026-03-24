import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale-service/sale.service';
import { ISale } from '../../../types/interfaces/sales.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';

@Component({
  selector: 'app-sales-history-detail',
  standalone: true,
  imports: [CommonModule, GenericTable],
  templateUrl: './sales-history-detail.html',
  styleUrl: './sales-history-detail.scss',
})
export class SalesHistoryDetail implements OnInit {
  isLoading: boolean = false;
  saleDetail?: ISale;

  columns: Array<ColumnProps> = [
    { label: 'Barcode', id: 'barcode' },
    { label: 'Product Name', id: 'product_name' },
    { label: 'Qty', id: 'item_qty' },
    { label: 'Price', id: 'sale_price', dataType: 'CURRENCY' },
    { label: 'Discount', id: 'discount_amount', dataType: 'CURRENCY' },
    { label: 'Net Total', id: 'net_price', dataType: 'CURRENCY' }
  ];

  constructor(
    private route: ActivatedRoute,
    private saleService: SaleService
  ) { }

  goBack() {
    window.history.back();
  }

  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('sale_id');
    if (saleId) {
      this.getDetail(saleId);
    }
  }

  getDetail(id: string) {
    this.isLoading = true;
    this.saleService.getSellingDetail(id).subscribe({
      next: (res) => {
        this.saleDetail = res.detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

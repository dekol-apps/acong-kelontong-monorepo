import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleService } from '../services/sale-service/sale.service';
import { ISaleItem } from '../../../types/interfaces/sales.interface';
import { DatePipe } from '@angular/common';
import { DATE_FORMAT } from '../../../types/constants/common.constants';
import { RupiahPipe } from '../../../shared/pipes/rupiah.pipe';

@Component({
  selector: 'app-sale-stock-item-detail',
  imports: [DatePipe, RupiahPipe],
  standalone: true,
  templateUrl: './sale-stock-item-detail.html',
  styleUrl: './sale-stock-item-detail.scss',
})
export class SaleStockItemDetail implements OnInit {
  isLoading: boolean = false;
  saleItemId: string = '';
  productId: string = '';
  detail?: ISaleItem;

  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private service: SaleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.saleItemId = this.route.snapshot.paramMap.get('sale_item_id') || '';
    this.productId = this.route.snapshot.paramMap.get('product_id') || '';
  }

  ngOnInit(): void {
    if (this.saleItemId) {
      this.getDetail();
    }
  }

  getDetail() {
    this.isLoading = true;
    this.service.getSaleStockDetail(this.saleItemId).subscribe({
      next: (res: any) => {
        this.detail = res.detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../listing/inventory-service/inventory.service';
import { IInventoryItem } from '../../../types/interfaces/inventory.interface';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { IResDetail } from '../../../types/interfaces/http.interface';
import { DATE_FORMAT, CURRENCY_FORMAT } from '../../../types/constants/common.constants';

@Component({
  selector: 'app-inventory-item-detail',
  imports: [CurrencyPipe, DatePipe, PercentPipe],
  standalone: true,
  templateUrl: './inventory-item-detail.html',
  styleUrl: './inventory-item-detail.scss',
})
export class InventoryItemDetail implements OnInit {
  isLoading: boolean = false;
  inventoryItemId: string = '';
  productId: string = '';
  detail?: IInventoryItem;

  DATE_FORMAT = DATE_FORMAT;
  CURRENCY_FORMAT = CURRENCY_FORMAT;

  constructor(
    private service: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.inventoryItemId = this.route.snapshot.paramMap.get('inventory_item_id') || '';
    this.productId = this.route.snapshot.paramMap.get('product_id') || '';
  }

  ngOnInit(): void {
    if (this.inventoryItemId) {
      this.getDetail();
    }
  }

  getDetail() {
    this.isLoading = true;
    this.service.getInventoryDetail(this.inventoryItemId).subscribe({
      next: (res: any) => {
        // res is likely IResDetail<IInventoryItem>
        this.detail = res.detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/inventory', this.productId]);
  }
}

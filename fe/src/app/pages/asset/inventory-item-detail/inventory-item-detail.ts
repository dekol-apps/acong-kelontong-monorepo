import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../listing/inventory-service/inventory.service';
import { IInventoryItem } from '../../../types/interfaces/inventory.interface';
import { SharedInventoryItemDetail } from '../shared-inventory-item-detail/shared-inventory-item-detail';

@Component({
  selector: 'app-inventory-item-detail',
  imports: [SharedInventoryItemDetail],
  standalone: true,
  templateUrl: './inventory-item-detail.html',
  styleUrl: './inventory-item-detail.scss',
})
export class InventoryItemDetail implements OnInit {
  isLoading: boolean = false;
  inventoryItemId: string = '';
  productId: string = '';
  detail?: IInventoryItem;

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

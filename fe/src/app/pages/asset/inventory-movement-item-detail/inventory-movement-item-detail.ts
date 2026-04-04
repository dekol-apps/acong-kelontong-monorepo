import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../services/inventory-service/inventory.service';
import { SharedInventoryItemDetail } from '../shared-inventory-item-detail/shared-inventory-item-detail';

@Component({
  selector: 'app-inventory-movement-item-detail',
  imports: [SharedInventoryItemDetail],
  standalone: true,
  templateUrl: './inventory-movement-item-detail.html',
  styleUrl: './inventory-movement-item-detail.scss',
})
export class InventoryMovementItemDetail implements OnInit {
  isLoading: boolean = false;
  movementId: string = '';
  itemId: string = '';
  detail?: any;

  constructor(
    private service: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.movementId = this.route.snapshot.paramMap.get('inventory_movement_id') || '';
    this.itemId = this.route.snapshot.paramMap.get('inventory_item_id') || '';
  }

  ngOnInit(): void {
    if (this.movementId) {
      this.getDetail();
    }
  }

  getDetail() {
    this.isLoading = true;
    this.service.getInventoryMovementDetail(this.movementId).subscribe({
      next: (res: any) => {
        const item = res.detail.items.find((i: any) => i._id === this.itemId);
        this.detail = item;
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

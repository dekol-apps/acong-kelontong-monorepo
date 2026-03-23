import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../services/inventory-service/inventory.service';
import { IInventoryMovement, IInventoryMovementItem } from '../../../types/interfaces/inventory.interface';
import { ColumnProps, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { GenericTable } from '../../../shared/components/generic-table/generic-table';
import { RouterLink } from '@angular/router';
import { TableColumn } from '../../../shared/directives/table-column/table-column';

@Component({
  selector: 'app-inventory-movement-detail',
  imports: [GenericTable, TableColumn, RouterLink, CommonModule],
  standalone: true,
  templateUrl: './inventory-movement-detail.html',
  styleUrl: './inventory-movement-detail.scss',
})
export class InventoryMovementDetail {
  isLoading: boolean = false;
  movementId: string = '';
  detail?: IInventoryMovement;

  columns: Array<ColumnProps> = [
    {
      label: 'Product Name',
      id: 'product_name',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Unit Of Measure',
      id: 'product.unit_of_measure',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Inventory Received Date',
      id: 'receive_date',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE'
    },
    {
      label: 'Landed Cost',
      id: 'landed_cost',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Original PPn Rate',
      id: 'original_ppn_rate',
      extraHeaderClass: 'uppercase-text',
      dataType: 'PERCENTAGE'
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action',
    }
  ]

  constructor(private service: InventoryService, private route: ActivatedRoute, private router: Router) {
    this.movementId = this.route.snapshot.paramMap.get('inventory_movement_id') || '';
    if (this.movementId) {
      this.getList()
    }
  }

  getList() {
    this.isLoading = true;
    this.service.getInventoryMovementDetail(this.movementId).subscribe({
      next: (res) => {
        this.detail = res.detail;
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/inventory-movement']);
  }
}

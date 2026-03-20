import { Component, OnInit } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IInventorySummary } from '../../../types/interfaces/inventory.interface';
import { InventoryService } from '../listing/inventory-service/inventory.service';

@Component({
  selector: 'app-inventory-item',
  imports: [GenericTable, TableColumn, RouterLink],
  standalone: true,
  templateUrl: './inventory-item.html',
  styleUrl: './inventory-item.scss',
})
export class InventoryItem {
  isLoading: boolean = false;
  productId: string = '';
  listInventory: IInventorySummary[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Receive Date',
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
      label: 'Original Price',
      id: 'original_price',
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

  defaultQuery = {
    page: this.pagination.page,
    size: this.pagination.size,
    search: '',
  }

  constructor(private service: InventoryService, private route: ActivatedRoute, private router: Router) {
    this.productId = this.route.snapshot.paramMap.get('product_id') || '';
    if (this.productId) {
      this.getList(this.defaultQuery)
    }
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getInventoryItemsByProductId(this.productId, {
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        this.listInventory = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 0,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 0,
          totalPages: res.meta?.totalPages ?? 0
        }
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['/inventory']);
  }
}

import { Component, OnInit } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { RouterLink } from '@angular/router';
import { IInventorySummary } from '../../../types/interfaces/inventory.interface';
import { InventoryService } from '../services/inventory-service/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [GenericTable, TableColumn, RouterLink],
  standalone: true,
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class Inventory implements OnInit {
  isLoading: boolean = false;
  listInventory: IInventorySummary[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Product Name',
      id: 'product_name',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'SKU',
      id: 'product_sku',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Total Qty',
      id: 'item_qty',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Avg Landed Cost',
      id: 'avg_landed_cost',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Total Landed Cost',
      id: 'total_landed_cost',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
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

  constructor(private service: InventoryService) { }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getInventoryItems({
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

  ngOnInit(): void {
    this.getList(this.defaultQuery)
  }
}

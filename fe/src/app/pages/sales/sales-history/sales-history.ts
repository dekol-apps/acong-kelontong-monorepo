import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ISale } from '../../../types/interfaces/sales.interface';
import { SaleService } from '../services/sale-service/sale.service';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, RouterModule, GenericTable, TableColumn],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.scss'
})
export class SalesHistory implements OnInit {
  isLoading: boolean = false;
  listSales: ISale[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    { id: 'items', label: 'Products', customElementId: 'items' },
    { label: 'Date', id: 'createdAt', dataType: 'DATE', sort: true },
    { label: 'Grand Total', id: 'grand_total', dataType: 'CURRENCY' },
    { label: 'Action', id: 'action', customElementId: 'action' }
  ];

  constructor(private saleService: SaleService) { }

  ngOnInit(): void {
    this.getList(this.pagination);
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.saleService.listSelling(evt).subscribe({
      next: (res) => {
        this.listSales = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 1,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 10,
          totalPages: res.meta?.totalPages ?? 1
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

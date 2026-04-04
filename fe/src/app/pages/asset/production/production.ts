import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { ProductionService } from '../services/production-service/production.service';
import { IProduction, ProductionEn } from '../../../types/interfaces/production.interface';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [CommonModule, GenericTable, TableColumn, RouterModule],
  templateUrl: './production.html',
  styleUrl: './production.scss'
})
export class Production implements OnInit {
  columns: ColumnProps[] = [
    { id: 'product', label: 'Product', customElementId: 'product' },
    { id: 'item_qty', label: 'Qty' },
    { id: 'grand_total_cost', label: 'Total Cost', dataType: 'CURRENCY' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Created At', dataType: 'DATE' },
    { id: 'action', label: 'Actions', customElementId: 'action' },
  ];

  list: IProduction[] = [];
  pagination: IPaginationInput = {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  };

  isLoading = false;

  ProductionEn = ProductionEn;

  constructor(private productionService: ProductionService) { }

  ngOnInit(): void {
    this.getList({
      page: 1,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
  }

  getList(query: ITableQueryData) {
    this.isLoading = true;
    this.productionService.list(query).subscribe({
      next: (res) => {
        console.log('getList', res)
        this.list = res.list;
        if (res.meta) {
          this.pagination = { ...this.pagination, ...res.meta };
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }
}

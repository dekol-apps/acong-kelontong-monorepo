import { Component, OnInit } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { RouterLink } from '@angular/router';
import { ISaleStockSummary } from '../../../types/interfaces/sales.interface';
import { SaleService } from '../services/sale-service/sale.service';

@Component({
  selector: 'app-sale-stock',
  imports: [GenericTable, TableColumn, RouterLink],
  standalone: true,
  templateUrl: './sale-stock.html',
  styleUrl: './sale-stock.scss'
})
export class SaleStock implements OnInit {
  isLoading: boolean = false;
  listSaleStock: ISaleStockSummary[] = [];
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
      label: 'Brand',
      id: 'brand_name',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Barcode',
      id: 'barcode',
      extraHeaderClass: 'uppercase-text',
    },
    {
      label: 'Total Qty',
      id: 'item_qty',
      extraHeaderClass: 'uppercase-text',
      sort: true
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

  constructor(private service: SaleService) { }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getSaleStocks({
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        this.listSaleStock = res.list ?? [];
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

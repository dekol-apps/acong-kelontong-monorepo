import { Component } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ISaleItem } from '../../../types/interfaces/sales.interface';
import { SaleService } from '../services/sale-service/sale.service';

@Component({
  selector: 'app-sale-stock-item',
  imports: [GenericTable, TableColumn, RouterLink],
  standalone: true,
  templateUrl: './sale-stock-item.html',
  styleUrl: './sale-stock-item.scss',
})
export class SaleStockItem {
  isLoading: boolean = false;
  productId: string = '';
  listSaleStockItems: ISaleItem[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 0,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Date Added',
      id: 'createdAt',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE'
    },
    {
        label: 'Original Price',
        id: 'original_price',
        extraHeaderClass: 'uppercase-text',
        dataType: 'CURRENCY'
    },
    {
      label: 'Sale Price',
      id: 'sale_price',
      extraHeaderClass: 'uppercase-text',
      dataType: 'CURRENCY'
    },
    {
      label: 'Discount',
      id: 'discount_percent',
      extraHeaderClass: 'uppercase-text',
      dataType: 'PERCENTAGE'
    },
    {
      label: 'COGS',
      id: 'cogs',
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

  constructor(private service: SaleService, private route: ActivatedRoute, private router: Router) {
    this.productId = this.route.snapshot.paramMap.get('product_id') || '';
    if (this.productId) {
      this.getList(this.defaultQuery)
    }
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getSaleStocksByProductId(this.productId, {
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        this.listSaleStockItems = res.list ?? [];
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
    this.router.navigate(['/sale-stock']);
  }
}

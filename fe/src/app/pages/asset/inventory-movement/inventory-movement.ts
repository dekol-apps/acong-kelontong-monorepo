import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { InventoryService } from '../listing/inventory-service/inventory.service';
import { IInventoryMovement } from '../../../types/interfaces/inventory.interface';
import { IPaginationInput } from '../../../types/interfaces/common.interface';
import { RouterModule } from '@angular/router';
import { FlowType } from '../../../types/enums/common.enum';

@Component({
  selector: 'app-inventory-movement',
  standalone: true,
  imports: [CommonModule, NgbNavModule, GenericTable, TableColumn, RouterModule],
  templateUrl: './inventory-movement.html',
  styleUrl: './inventory-movement.scss'
})
export class InventoryMovement implements OnInit {
  activeTab = FlowType.IN;
  FlowType = FlowType;

  columnsIn: ColumnProps[] = [
    { id: 'items', label: 'Products', customElementId: 'items' },
    { id: 'createdAt', label: 'Movement Date', dataType: 'DATE' },
    { id: 'order_type', label: 'Source Type' },
    { id: 'description', label: 'Description', maxWidth: '200px', ellipsis: true },
    { id: 'action', label: 'Actions', customElementId: 'action' },
  ];

  columnsOut: ColumnProps[] = [
    { id: 'items', label: 'Products', customElementId: 'items' },
    { id: 'createdAt', label: 'Movement Date', dataType: 'DATE' },
    { id: 'order_type', label: 'Source Type' },
    { id: 'description', label: 'Description', maxWidth: '200px', ellipsis: true },
    { id: 'action', label: 'Actions', customElementId: 'action' },
  ];

  listIn: IInventoryMovement[] = [];
  listOut: IInventoryMovement[] = [];

  paginationIn: IPaginationInput = {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  };

  paginationOut: IPaginationInput = {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  };

  isLoadingIn = false;
  isLoadingOut = false;

  defaultQuery: ITableQueryData = {
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
    search: '',
  };

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.getListIn(this.defaultQuery);
    this.getListOut(this.defaultQuery);
  }

  getListIn(query: ITableQueryData) {
    this.isLoadingIn = true;
    this.inventoryService.getInventoryMovements({ ...query, movement_type: FlowType.IN } as any).subscribe({
      next: (res) => {
        this.listIn = res.list;
        console.log('listIn', this.listIn)
        if (res.meta) {
          this.paginationIn = { ...this.paginationIn, ...res.meta };
        }
        this.isLoadingIn = false;
      },
      error: () => (this.isLoadingIn = false),
    });
  }

  getListOut(query: ITableQueryData) {
    this.isLoadingOut = true;
    this.inventoryService.getInventoryMovements({ ...query, movement_type: FlowType.OUT } as any).subscribe({
      next: (res) => {
        this.listOut = res.list;
        if (res.meta) {
          this.paginationOut = { ...this.paginationOut, ...res.meta };
        }
        this.isLoadingOut = false;
      },
      error: () => (this.isLoadingOut = false),
    });
  }

  tabChange(tab: FlowType) {
    this.activeTab = tab;
  }
}

import { Component } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { IInvestment } from '../../../types/interfaces/investment.interface';
import { InvestmentService } from '../investment.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { InvestmentForm, investmentFormPageType } from '../investment-form/investment-form';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { InvestmentType } from '../../../types/enums/common.enum';
import { IPaginationInput } from '../../../types/interfaces/common.interface';

@Component({
  selector: 'app-deposit',
  imports: [GenericTable, TableColumn],
  standalone: true,
  templateUrl: './deposit.html',
  styleUrl: './deposit.scss'
})
export class Deposit {
  isLoading: boolean = false;
  listDeposit: IInvestment[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Amount',
      id: 'transaction_amount',
      extraHeaderClass: 'uppercase-text',
      sort: true,
      dataType: 'CURRENCY'
    },
    {
      label: 'Transaction Date',
      id: 'createdAt',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
      sort: true
    },
    {
      label: 'Description',
      id: 'description',
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

  constructor(private service: InvestmentService, private modalService: NgbModal) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getListInvestment({
      investment_type: InvestmentType.DEPOSIT,
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        console.log({ res })
        this.listDeposit = res.list ?? [];
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

  showForm(type: investmentFormPageType, id?: string) {
    const modalRef = this.modalService.open(InvestmentForm, this.modalOptions);
    modalRef.componentInstance.type = 'deposit';
    modalRef.componentInstance.page = type;
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.close.subscribe((res) => {
      console.log({ res })
      modalRef.dismiss();
      if (res) this.getList(this.defaultQuery);
    })
  }
}

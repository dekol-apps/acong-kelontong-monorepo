import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { InvestmentType, IPaginationInput } from '../../../types/interfaces/common.interface';
import { IInvestment } from '../../../types/interfaces/investment.interface';
import { investmentFormPageType, InvestmentForm } from '../investment-form/investment-form';
import { InvestmentService } from '../investment.service';

@Component({
  selector: 'app-withdrawal',
  imports: [GenericTable],
  standalone: true,
  templateUrl: './withdrawal.html',
  styleUrl: './withdrawal.scss'
})
export class Withdrawal {
  @ViewChild('DeleteModal') confrimDelete?: ConfirmModal;
  isLoading: boolean = false;
  listWithdrawal: IInvestment[] = [];
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };

  columns: Array<ColumnProps> = [
    {
      label: 'Amount',
      id: 'amount.$numberDecimal',
      extraHeaderClass: 'uppercase-text',
      sort: true
    },
    {
      label: 'Transaction Date',
      id: 'transaction_date',
      extraHeaderClass: 'uppercase-text',
      dataType: 'DATE',
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
      investment_type: InvestmentType.WITHDRAWAL,
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        console.log({ res })
        this.listWithdrawal = res.list ?? [];
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
    modalRef.componentInstance.type = 'withdrawal';
    modalRef.componentInstance.page = type;
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.close.subscribe((res) => {
      console.log({ res })
      modalRef.dismiss();
      if (res) this.getList(this.defaultQuery);
    })
  }
}

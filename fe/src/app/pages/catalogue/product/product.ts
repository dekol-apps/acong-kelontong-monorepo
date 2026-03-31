import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ColumnProps, GenericTable, ITableQueryData } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { formType, IPaginationInput, ISelectFilter } from '../../../types/interfaces/common.interface';
import { SORT_DIR } from '../../../types/constants/common.constants';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { ProductService } from './product.service';
import { ProductForm } from './product-form/product-form';

@Component({
  selector: 'app-product',
  imports: [GenericTable, TableColumn, ConfirmModal],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class Product implements OnInit {
  @ViewChild('ConfirmModal') confrimModal?: ConfirmModal;

  isLoading: boolean = false;
  listProduct: IProduct[] = [];
  
  pagination: IPaginationInput = {
    page: 1,
    total: 100,
    size: 10,
    totalPages: 1
  };
   columns: Array<ColumnProps> = [
    {
      label: 'Product Name',
      id: 'product_name',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'product_name',
      sort: true,
    },
    {
      label: 'SKU',
      id: 'product_sku',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'product_sku',
      sort: true,
    },
    {
      label: 'Brand',
      id: 'brand.brand_name',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'brand.brand_name',
    },
    {
      label: 'UOM',
      id: 'unit_of_measure',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'unit_of_measure',
      sort: true,
    },
    {
      label: 'Barcode',
      id: 'barcode',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'barcode',
    },
    {
      label: 'Description',
      id: 'product_description',
      extraHeaderClass: 'uppercase-text',
      backendPropName: 'product_description',
    },
    {
      label: 'Action',
      id: 'action',
      extraHeaderClass: 'uppercase-text w-100 d-flex justify-content-end',
      customElementId: 'action',
    }
  ]

  defaultTableParam = {
    page: this.pagination.page,
    size: this.pagination.size,
    sortBy: '',
    sortDir: SORT_DIR.ASC,
    search: '',
  }

  activeModal = Inject(NgbActiveModal);

  constructor(private service: ProductService, private modalService: NgbModal, private alert: AlertService) { }

  modalOptions: NgbModalOptions = {
    size: 'xl'
  }

  showForm(type: formType, id?: string) {
    const modalRef = this.modalService.open(ProductForm, this.modalOptions);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.close.subscribe((res) => {
      modalRef.dismiss();
      if (res) this.getList(this.defaultTableParam);
    })
  }

  getList(evt: ITableQueryData) {
    this.isLoading = true;
    this.service.getProducts({
      page: evt.page,
      size: evt.size,
      sortBy: evt.sortBy,
      sortDir: evt.sortDir,
      search: evt.search,
    }).subscribe({
      next: (res) => {
        this.listProduct = res.list ?? [];
        this.pagination = {
          page: res.meta?.page ?? 0,
          total: res.meta?.total ?? 0,
          size: res.meta?.size ?? 0,
          totalPages: res.meta?.totalPages ?? 0
        }
        console.log({listProduct: this.listProduct})
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.getList(this.defaultTableParam);
  }

  deleteProduct(product: IProduct) {
    const product_id = product._id;
    const itemName = `${product.product_name}`;
    this.confrimModal?.show({ itemName }).then((res: any) => {
      if (res && product_id) {
        this.execDeleteion(product_id);
      }
    })
  }

  execDeleteion(role_id: string) {
    this.service.deleteProduct(role_id).subscribe(() => {
      this.alert.success('Product deleted')
      this.getList(this.defaultTableParam);
    });
  }
}


import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../shared/components/alert/alert-service';
import { FormValidation } from '../../../../../shared/directives/form-validation/form-validation';
import { formType } from '../../../../../types/interfaces/common.interface';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { IProduct } from '../../../../../types/interfaces/catalogue.interface';
import { ProductService } from '../../../../catalogue/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { nativeToNgbDate, ngbToNativeDate } from '../../../../../shared/components/date-range-filter/date-range-filter';
import { MONEY_REGEX, toMoneyString } from '../../../../../utils/helper';
@Component({
  selector: 'app-purchase-order-item-form',
  imports: [ReactiveFormsModule, FormValidation, NgbDatepickerModule],
  templateUrl: './purchase-order-item-form.html',
  styleUrl: './purchase-order-item-form.scss'
})
export class PurchaseOrderItemForm implements OnInit, AfterViewInit, OnChanges {
  @Input() type?: formType = 'new';
  @Input() purchase_id?: string;
  @Input() purchase_item_id?: string;
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoading: boolean = false;
  products: IProduct[] = [];

  form: FormGroup = new FormGroup({
    purchase_order: new FormControl(this.purchase_id, [Validators.required]),
    product: new FormControl(null, [Validators.required]),
    purchase_qty: new FormControl(null, [Validators.required]),
    purchase_price: new FormControl(null, [Validators.required, Validators.pattern(MONEY_REGEX)]),
  });

  constructor(private service: PurchaseOrderService, private alert: AlertService, private productSvc: ProductService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getProducts();
    if (this.purchase_item_id) {
      this.service.getPurchaseItemDetail(this.purchase_item_id).subscribe((res) => {
        this.form.patchValue({
          ...res,
          purchase_order: res.purchase_order?._id,
          product: res.product?._id,
          exp_date: nativeToNgbDate(res.exp_date),
          purchase_price: res.purchase_price
        });
      })
    }
    if (this.purchase_id) {
      this.form.controls.purchase_order.patchValue(this.purchase_id);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      console.log({ changes })
      if (this.purchase_item_id) {
        this.service.getPurchaseItemDetail(this.purchase_item_id).subscribe((res) => {
          this.form.patchValue({
            ...res,
            exp_date: nativeToNgbDate(res.exp_date)
          });
          console.log('this.form.value', this.form.value)
        })
      }
      if (this.purchase_id) {
        this.form.controls.purchase_order.patchValue(this.purchase_id);
      }
    }
  }

  getProducts() {
    this.productSvc.getProducts({ page: 0, size: 1000 }).subscribe((res) => {
      this.products = res.list ?? [];
    })
  }

  ngAfterViewInit(): void {

  }

  submit() {
    if (!this.purchase_id) return this.alert.error('Missing purchase id, please reload page')
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = this.form.value;
    body.purchase_price = toMoneyString(body.purchase_price);
    body.exp_date = ngbToNativeDate(body.exp_date);
    let serviceArgs = this.service.createPurchaseItem(body);
    if (this.type === 'edit' && this.purchase_item_id) serviceArgs = this.service.editPurchaseItem(this.purchase_item_id, body);
    serviceArgs.subscribe((res) => {
      this.alert.success(`Success ${this.type == 'edit' ? 'edit' : 'add'} purchasing item!`);
      this.onClose.emit(true);
    })
  }
}
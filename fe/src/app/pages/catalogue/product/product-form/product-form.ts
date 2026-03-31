import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidation } from '../../../../shared/directives/form-validation/form-validation';
import { AlertService } from '../../../../shared/components/alert/alert-service';
import { formType } from '../../../../types/interfaces/common.interface';
import { ProductService } from '../product.service';
import { IBrand } from '../../../../types/interfaces/catalogue.interface';
import { BrandService } from '../../brand/brand-service';
import { TUOM, UnitOfMeasure } from '../../../../types/constants/common.constants';
import { AutoWildcard } from '../../../../shared/directives/auto-wildcard/auto-wildcard';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, FormValidation, AutoWildcard],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit, AfterViewInit {
  @Input() type: formType = 'new';
  @Input() id?: string;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>()

  brands: IBrand[] = [];
  uoms: TUOM[] = Object.values(UnitOfMeasure);
  isLoading: boolean = false;

  form: FormGroup = new FormGroup({
    product_name: new FormControl(null, [Validators.required]),
    product_description: new FormControl(null),
    brand: new FormControl(null, [Validators.required]),
    unit_of_measure: new FormControl(null, [Validators.required]), // value is string TUOM
    barcode: new FormControl(null),
  });

  constructor(
    private productService: ProductService,
    private alert: AlertService,
    private brandService: BrandService
  ) { }

  ngOnInit(): void {
    this.getBrands()
  }

  getBrands() {
    this.isLoading = true;
    this.brandService.getBrands({ page: 0, size: 1000 }).subscribe((res) => {
      this.brands = res.list ?? [];
    })
  }


  ngAfterViewInit(): void {
    if (this.id) {
      this.productService.getProductDetail(this.id).subscribe((res) => {
        const { product_name, product_description, unit_of_measure, barcode, brand } = res.detail
        this.form.patchValue({
          product_name,
          product_description,
          unit_of_measure,
          barcode,
          brand
        });
        console.log('this.form.value', this.form.value)
      })
    }
  }

  submit() {
    if (this.form.invalid) return this.alert.error('Please check your inputs');
    const body = this.form.value;
    console.log({ body })
    let serviceArgs = this.productService.createProduct(body);
    if (this.type === 'edit' && this.id) serviceArgs = this.productService.editProduct(this.id, body);
    serviceArgs.subscribe((res) => {
      this.alert.success(res.message ?? `Success ${this.type == 'edit' ? 'edit' : 'create'} product!`);
      this.close.emit(true);
    })
  }
}


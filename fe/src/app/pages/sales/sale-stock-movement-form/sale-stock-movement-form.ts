import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SaleService } from '../services/sale-service/sale.service';
import { ProductService } from '../../catalogue/product/product.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';

@Component({
  selector: 'app-sale-stock-movement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbDropdownModule,
    FormValidation
  ],
  templateUrl: './sale-stock-movement-form.html',
  styleUrl: './sale-stock-movement-form.scss',
})
export class SaleStockMovementForm implements OnInit {
  form: FormGroup;
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  isLoading = false;

  constructor(
    private saleService: SaleService,
    private productService: ProductService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.form = new FormGroup({
      items: new FormArray([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.getProducts();
    this.addItem(); // Start with one item
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = new FormGroup({
      product: new FormControl(null, [Validators.required]),
      product_name: new FormControl(''),
      item_qty: new FormControl(1, [Validators.required, Validators.min(1)]),
      sale_price: new FormControl(0, [Validators.required, Validators.min(0)]),
      original_price: new FormControl(0, [Validators.required, Validators.min(0)]),
      discount_percent: new FormControl(0, [Validators.min(0), Validators.max(100)]),
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getProducts(): void {
    this.productService.getProducts({ page: 1, size: 1000 }).subscribe({
      next: (res) => {
        this.products = res.list || [];
        this.filteredProducts = [...this.products];
      }
    });
  }

  filterProducts(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.product_name.toLowerCase().includes(query)
    );
  }

  selectProduct(index: number, product: IProduct): void {
    const item = this.items.at(index);
    item.patchValue({
      product: product._id,
      product_name: product.product_name
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.error('Please fill all required fields correctly.');
      return;
    }

    this.isLoading = true;
    const body = {
      items: this.form.value.items.map((item: any) => ({
        product: item.product,
        item_qty: item.item_qty,
        sale_price: item.sale_price.toString(),
        original_price: item.original_price.toString(),
        discount_percent: item.discount_percent
      }))
    };

    console.log('payload body', body);

    this.saleService.addStock(body).subscribe({
      next: () => {
        this.alertService.success('Sale stock updated successfully');
        this.router.navigate(['/sales']);
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.error(err.error?.message || err.message || 'Failed to update sale stock');
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sales']);
  }
}

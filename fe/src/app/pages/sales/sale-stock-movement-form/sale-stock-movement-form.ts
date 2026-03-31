import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale-service/sale.service';
import { ProductService } from '../../catalogue/product/product.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { DropdownSearch } from '../../../shared/components/dropdown-search/dropdown-search';
import { ISelectValue } from '../../../types/interfaces/common.interface';
import { InventoryService } from '../../asset/services/inventory-service/inventory.service';
import { IInventorySummary } from '../../../types/interfaces/inventory.interface';

@Component({
  selector: 'app-sale-stock-movement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DropdownSearch,
    FormValidation
  ],
  templateUrl: './sale-stock-movement-form.html',
  styleUrl: './sale-stock-movement-form.scss',
})
export class SaleStockMovementForm implements OnInit {
  form: FormGroup;
  products: IInventorySummary[] = [];
  filteredProducts: ISelectValue[] = [];
  isLoading = false;
  errorReq?: string;
  constructor(
    private saleService: SaleService,
    private inventorySvc: InventoryService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
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
      avg_landed_cost: new FormControl(0, [Validators.required, Validators.min(0)]),
      discount_percent: new FormControl(0, [Validators.min(0), Validators.max(100)]),
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  getProducts(search: string = ''): void {
    this.isLoading = true;
    this.inventorySvc.getInventoryItems({ search, page: 1, size: 50 }).subscribe({
      next: (res) => {
        this.products = res.list || [];
        this.filteredProducts = this.products.map(p => ({
          value: p,
          label: `${p.product_name} (${p.product_sku || '-'}) - Stock: ${p.item_qty}`
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectProduct(index: number, inventory: IInventorySummary): void {
    const item = this.items.at(index);
    item.patchValue({
      product: inventory.product,
      product_name: inventory.product_name,
      avg_landed_cost: inventory.avg_landed_cost,
      sale_price: inventory.avg_landed_cost,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.error('Please fill all required fields correctly.');
      return;
    }

    const body = {
      items: this.form.value.items.map((item: any) => ({
        product: item.product,
        item_qty: item.item_qty,
        sale_price: item.sale_price.toString(),
        avg_landed_cost: item.avg_landed_cost.toString(),
        discount_percent: item.discount_percent
      }))
    };

    console.log('payload body', body);

    this.saleService.addStock(body).subscribe({
      next: () => {
        this.alertService.success('Sale stock updated successfully');
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        console.log(err.error?.message)
        this.errorReq = err.error?.message || err.message || 'Failed to update sale stock';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

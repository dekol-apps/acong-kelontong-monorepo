import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductionService } from '../services/production-service/production.service';
import { ProductService } from '../../catalogue/product/product.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { ISelectValue } from '../../../types/interfaces/common.interface';
import { DropdownSearch } from '../../../shared/components/dropdown-search/dropdown-search';
import { MONEY_REGEX, toMoneyString } from '../../../utils/helper';

@Component({
  selector: 'app-production-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GenericTable,
    TableColumn,
    FormValidation,
    DropdownSearch
  ],
  templateUrl: './production-form.html',
  styleUrl: './production-form.scss'
})
export class ProductionForm implements OnInit {
  form: FormGroup;
  products: IProduct[] = [];
  filteredProducts: ISelectValue[] = [];
  isLoading = false;
  productionId: string | null = null;

  columns: ColumnProps[] = [
    { id: 'product', label: 'Ingredient', customElementId: 'product' },
    { id: 'item_qty', label: 'Quantity', customElementId: 'item_qty' },
    { id: 'action', label: 'Action', customElementId: 'action' },
  ];

  constructor(
    private productionService: ProductionService,
    private productService: ProductService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = new FormGroup({
      product: new FormControl(null, [Validators.required]),
      product_name: new FormControl(''),
      item_qty: new FormControl(1, [Validators.required, Validators.min(1)]),
      price_per_item: new FormControl(0, [Validators.required, Validators.min(0), Validators.pattern(MONEY_REGEX)]),
      operational_cost: new FormControl(0, [Validators.required, Validators.min(0), Validators.pattern(MONEY_REGEX)]),
      ingredients: new FormArray([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.getProducts('');
    this.productionId = this.route.snapshot.paramMap.get('id');
    if (this.productionId) {
      this.loadProduction();
    } else {
      this.addIngredient();
    }
  }

  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  addIngredient(): void {
    const ingredientForm = new FormGroup({
      product: new FormControl(null, [Validators.required]),
      product_name: new FormControl(''),
      item_qty: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
    this.ingredients.push(ingredientForm);
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  getProducts(search: string = ''): void {
    this.isLoading = true;
    this.productService.getProducts({ search, page: 1, size: 100 }).subscribe({
      next: (res) => {
        this.products = res.list || [];
        this.filteredProducts = this.products.map(p => ({
          value: p,
          label: `${p.product_name} (${p.product_sku || '-'})`
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  loadProduction(): void {
    if (!this.productionId) return;
    this.isLoading = true;
    this.productionService.detail(this.productionId).subscribe({
      next: (res) => {
        const detail = res.detail;
        if (detail) {
          this.form.patchValue({
            product: detail.product._id,
            product_name: detail.product.product_name,
            item_qty: detail.item_qty,
            price_per_item: detail.price_per_item,
            operational_cost: detail.operational_cost
          });
          // clear default if any
          this.ingredients.clear();
          detail.ingredients.forEach(ing => {
            const ingredientForm = new FormGroup({
              product: new FormControl(ing.product._id, [Validators.required]),
              product_name: new FormControl(ing.product.product_name),
              item_qty: new FormControl(ing.item_qty, [Validators.required, Validators.min(1)]),
            });
            this.ingredients.push(ingredientForm);
          });
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  selectMainProduct(product: IProduct): void {
    this.form.patchValue({
      product: product._id,
      product_name: product.product_name
    });
  }

  selectIngredientProduct(index: number, product: IProduct): void {
    const ingredient = this.ingredients.at(index);
    ingredient.patchValue({
      product: product._id,
      product_name: product.product_name
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.alertService.error('Please fill all required fields');
      this.form.markAllAsTouched();
      return;
    }

    const body = {
      ...this.form.value,
      price_per_item: toMoneyString(this.form.value.price_per_item),
      operational_cost: toMoneyString(this.form.value.operational_cost),
      ingredients: this.form.value.ingredients.map((ing: any) => ({
        product: ing.product,
        item_qty: ing.item_qty
      }))
    };

    const obs = this.productionId 
      ? this.productionService.update(this.productionId, body)
      : this.productionService.create(body);

    obs.subscribe({
      next: () => {
        this.alertService.success(`Production ${this.productionId ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/production']);
      },
      error: (err) => {
        this.alertService.error(err.message || 'Failed to save production');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/production']);
  }
}

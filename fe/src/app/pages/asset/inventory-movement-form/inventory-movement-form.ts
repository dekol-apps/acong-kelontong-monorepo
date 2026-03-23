import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { InventoryService } from '../listing/inventory-service/inventory.service';
import { ProductService } from '../../catalogue/product/product.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { FlowType, OrderType } from '../../../types/enums/common.enum';

@Component({
  selector: 'app-inventory-movement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbDropdownModule,
    GenericTable,
    TableColumn,
    FormValidation
  ],
  templateUrl: './inventory-movement-form.html',
  styleUrl: './inventory-movement-form.scss'
})
export class InventoryMovementForm implements OnInit {
  form: FormGroup;
  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];
  searchControl = new FormControl('');
  isLoading = false;

  FlowType = FlowType;
  OrderType = OrderType;

  columns: ColumnProps[] = [
    { id: 'product', label: 'Product', customElementId: 'product' },
    { id: 'item_qty', label: 'Quantity', customElementId: 'item_qty' },
    { id: 'action', label: 'Action', customElementId: 'action' },
  ];

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.form = new FormGroup({
      movement_type: new FormControl(FlowType.IN, [Validators.required]),
      order_type: new FormControl(OrderType.ADJUSTMENT, [Validators.required]),
      description: new FormControl('', [Validators.required]),
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
      receive_date: new FormControl(new Date(), [Validators.required]),
      original_ppn_rate: new FormControl(0, [Validators.required]),
      original_price: new FormControl(0, [Validators.required]),
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
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
      this.alertService.error('Please fill all required fields');
      return;
    }

    this.isLoading = true;
    const body = {
      ...this.form.value,
      items: this.form.value.items.map((item: any) => ({
        product: item.product,
        item_qty: item.item_qty,
        receive_date: item.receive_date,
        original_ppn_rate: item.original_ppn_rate,
        original_price: item.original_price.toString(),
      }))
    };

    this.inventoryService.moveInventory(body).subscribe({
      next: () => {
        this.alertService.success('Inventory movement recorded successfully');
        this.router.navigate(['/inventory-movement']);
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.error(err.message || 'Failed to record movement');
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory-movement']);
  }
}

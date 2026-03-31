import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { InventoryService } from '../services/inventory-service/inventory.service';
import { ProductService } from '../../catalogue/product/product.service';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { IProduct } from '../../../types/interfaces/catalogue.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { FormValidation } from '../../../shared/directives/form-validation/form-validation';
import { FlowType, OrderType } from '../../../types/enums/common.enum';
import { DropdownSearch } from '../../../shared/components/dropdown-search/dropdown-search';
import { ISelectValue } from '../../../types/interfaces/common.interface';

@Component({
  selector: 'app-inventory-movement-form',
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
  templateUrl: './inventory-movement-form.html',
  styleUrl: './inventory-movement-form.scss'
})
export class InventoryMovementForm implements OnInit {
  form: FormGroup;
  products: IProduct[] = [];
  filteredProducts: ISelectValue[] = [];
  searchControl = new FormControl('');
  isLoading = false;

  FlowType = FlowType;
  OrderType = OrderType;

  columns: ColumnProps[] = [
    { id: 'product', label: 'Product', customElementId: 'product' },
    { id: 'item_qty', label: 'Quantity', customElementId: 'item_qty' },
    { id: 'action', label: 'Action', customElementId: 'action' },
  ];

  fullColumns: ColumnProps[] = [
    { id: 'product', label: 'Product', customElementId: 'product' },
    { id: 'item_qty', label: 'Quantity', customElementId: 'item_qty' },
    { id: 'original_price', label: 'Price', customElementId: 'original_price' },
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
    this.updateColumns(this.form.get('movement_type')?.value);

    this.form.get('movement_type')?.valueChanges.subscribe(value => {
      this.updateColumns(value);
    });
  }

  updateColumns(movementType: FlowType) {
    if (movementType === FlowType.IN) {
      this.columns = this.fullColumns;
    } else {
      this.columns = [
        { id: 'product', label: 'Product', customElementId: 'product' },
        { id: 'item_qty', label: 'Quantity', customElementId: 'item_qty' },
        { id: 'action', label: 'Action', customElementId: 'action' }
      ];
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = new FormGroup({
      product: new FormControl(null, [Validators.required]),
      product_name: new FormControl(''),
      item_qty: new FormControl(1, [Validators.required, Validators.min(1)]),
      original_price: new FormControl(0, [Validators.required]),
    });
    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getProducts(search: string = ''): void {
    this.isLoading = true;
    this.productService.getProducts({ search, page: 1, size: 50 }).subscribe({
      next: (res) => {
        this.products = res.list || [];
        this.filteredProducts = this.products.map(p => ({
          value: p,
          label: `${p.product_name} (${p.product_sku || '-'})`
        }));
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
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

    const isMoveIn = this.form.value.movement_type === FlowType.IN;

    const body = {
      ...this.form.value,
      items: this.form.value.items.map((item: any) => {
        const baseItem: any = {
          product: item.product,
          item_qty: item.item_qty,
        };

        if (isMoveIn) {
          baseItem.original_price = item.original_price.toString();
        }

        return baseItem;
      })
    };

    this.inventoryService.moveInventory(body).subscribe({
      next: () => {
        this.alertService.success('Inventory movement recorded successfully');
        this.router.navigate(['/inventory-movement']);
      },
      error: (err) => {
        this.alertService.error(err.message || 'Failed to record movement');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory-movement']);
  }
}

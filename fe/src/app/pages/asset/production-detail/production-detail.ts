import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductionService } from '../services/production-service/production.service';
import { IProduction, ProductionEn } from '../../../types/interfaces/production.interface';
import { ColumnProps, GenericTable } from '../../../shared/components/generic-table/generic-table';
import { TableColumn } from '../../../shared/directives/table-column/table-column';
import { AlertService } from '../../../shared/components/alert/alert-service';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';

@Component({
  selector: 'app-production-detail',
  standalone: true,
  imports: [GenericTable, TableColumn, CommonModule, ConfirmModal],
  templateUrl: './production-detail.html',
  styleUrl: './production-detail.scss',
})
export class ProductionDetail implements OnInit {
  @ViewChild('confirmModal') confirmModal?: ConfirmModal;

  isLoading: boolean = false;
  productionId: string = '';
  detail?: IProduction;
  ProductionEn = ProductionEn;

  columns: Array<ColumnProps> = [
    { label: 'Ingredient', id: 'product', customElementId: 'product' },
    { label: 'Qty', id: 'item_qty' },
    { label: 'Total Cost', id: 'total_cost', dataType: 'CURRENCY' },
  ];

  constructor(
    private productionService: ProductionService,
    private route: ActivatedRoute,
    private router: Router,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    // using the 'id' param from URL
    this.productionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productionId) {
      this.getDetail();
    }
  }

  getDetail() {
    this.isLoading = true;
    this.productionService.detail(this.productionId).subscribe({
      next: (res) => {
        this.detail = res.detail;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  conifrmStart() {
    this.confirmModal?.show().then((res: any) => {
      if (res) {
        this.startProduction();
      }
    })
  }

  confirmFinish() {
    this.confirmModal?.show().then((res: any) => {
      if (res) {
        this.finishProduction();
      }
    })
  }

  startProduction() {
    if (!this.detail?._id) return;
    this.productionService.start(this.detail._id).subscribe({
      next: () => {
        this.alert.success('Production started');
        this.getDetail();
      }
    });
  }

  finishProduction() {
    if (!this.detail?._id) return;
    this.productionService.finish(this.detail._id).subscribe({
      next: () => {
        this.alert.success('Production finished');
        this.getDetail();
      }
    });
  }

  back() {
    this.router.navigate(['/production']);
  }

  edit() {
    this.router.navigate(['/production/form', this.productionId]);
  }
}

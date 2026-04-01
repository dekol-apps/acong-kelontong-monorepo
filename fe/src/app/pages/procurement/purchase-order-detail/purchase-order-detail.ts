import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PurchasingDetail } from '../purchasing-detail/purchasing-detail';
import { ActivatedRoute, Router } from '@angular/router';
import { formType } from '../../../types/interfaces/common.interface';
import { IPurchasing, PurchasingEn } from '../../../types/interfaces/procurement.interface';
import { ConfirmModal } from '../../../shared/components/modals/confirm-modal/confirm-modal';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-purchase-order-detail',
  imports: [PurchasingDetail, ConfirmModal, FormsModule, TranslateModule],
  templateUrl: './purchase-order-detail.html',
  styleUrl: './purchase-order-detail.scss'
})
export class PurchaseOrderDetail {
  @ViewChild('DeleteModal') confrimDelete?: ConfirmModal;
  @ViewChild('ApproveModal') confrimApprove?: ConfirmModal;
  @ViewChild('RejectModal') confrimReject?: ConfirmModal;
  @ViewChild('RequestModal') confrimRequest?: ConfirmModal;

  purchase_id?: string;
  detail?: IPurchasing;
  PurchasingEn = PurchasingEn;

  isReceiveOrder?: boolean;
  constructor(private route: ActivatedRoute, private router: Router, private service: PurchaseOrderService) {
    this.purchase_id = this.route.snapshot.paramMap.get('po_id') || undefined;
    // check url if it include receive-order
    this.isReceiveOrder = this.router.url.includes('receive-order');
  }

  exit() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  deletePurchasing() {
    this.confrimDelete?.show().then((res: any) => {
      if (res) {
        this.execDeleteion(this.purchase_id!);
      }
    })
  }

  execDeleteion(purchasing_id: string) {
    this.service.dropPurchasing(purchasing_id).subscribe(() => {
      this.exit();
    });
  }

  edit() {
    this.router.navigateByUrl(`purchase-order/form/1/${this.purchase_id}`);
  }
  request() {
    this.confrimRequest?.show().then((res: any) => {
      if (res) {
        this.execRequestPO(this.purchase_id!);
      }
    })
  }
  execRequestPO(purchase_id: string) {
    this.service.requestPO(purchase_id).subscribe(() => {
      this.exit();
    });
  }
  payment() {
    this.router.navigateByUrl(`purchase-order/form/3/${this.purchase_id}`);
  }
  receive() {
    this.router.navigate([`./receive`], { relativeTo: this.route });
  }
  process() {
    this.service.processPO(this.purchase_id!).subscribe(() => {
      this.exit();
    });
  }
  approve() {
    this.service?.approvePO(this.purchase_id!).subscribe(() => {
      this.exit();
    })
  }
  rejectNotes: string = '';
  reject() {
    this.rejectNotes = '';
    this.confrimReject?.show().then((res: any) => {
      if (res) {
        this.execRejectPO(this.purchase_id!);
      }
    })
  }
  execRejectPO(purchase_id: string) {
    this.service?.rejectPO(purchase_id, this.rejectNotes).subscribe(() => {
      this.exit();
    })
  }
}

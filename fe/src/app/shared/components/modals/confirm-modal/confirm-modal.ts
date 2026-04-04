import { Component, TemplateRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [TranslateModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss'
})
export class ConfirmModal {
  @Input() type: 'delete' | 'action' = 'delete';
  @Input() itemName: string = "this item";
  @Input() customText?: string;
  @ViewChild('modalTemplateRef') modalTemplateRef!: TemplateRef<any>;
  modalRef!: NgbModalRef;

  constructor(private modalService: NgbModal) { }

  show(option?: { itemName?: string, customText?: string, type?: 'delete' | 'action'}): Promise<any> {
    if (option?.itemName) {
      this.itemName = option.itemName;
    }
    if (option?.customText) {
      this.customText = option.customText;
    }
    if (option?.type) {
      this.type = option.type;
    }
    if (this.modalTemplateRef) {
      this.modalRef = this.modalService.open(this.modalTemplateRef, { ariaLabelledBy: 'modal-basic-title' });
    } else console.error('Template reference "modalTemplateRef" is not available.');
    return this.modalRef.result;
  }

  ok() {
    if (this.modalRef) {
      this.modalRef.close(true);
    }
  }
}

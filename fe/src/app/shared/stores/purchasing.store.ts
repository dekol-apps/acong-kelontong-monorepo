import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { PurchaseOrderService } from '../../pages/procurement/services/purchase-order.service';
import { IPurchasing } from '../../types/interfaces/procurement.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchasingStore {

  private purchasingSubject = new BehaviorSubject<IPurchasing | undefined>(undefined);

  purchasing$ = this.purchasingSubject.asObservable();

  constructor(private service: PurchaseOrderService) { }

  get snapshot(): IPurchasing | undefined {
    return this.purchasingSubject.value;
  }

  setPurchasing(data: IPurchasing) {
    this.purchasingSubject.next(data);
  }

  create(dto: FormData | IPurchasing) {
    return this.service.createPurchasing(dto).pipe(
      tap(detail => {
        this.purchasingSubject.next(detail);
      })
    );
  }

  update(dto: FormData | IPurchasing) {
    const id = this.snapshot?._id;
    if (!id) throw new Error('Purchasing not initialized');

    return this.service.editPurchasing(id, dto).pipe(
      tap(detail => {
        this.purchasingSubject.next(detail);
      })
    );
  }

  payment(dto: FormData | IPurchasing) {
    const id = this.snapshot?._id;
    if (!id) throw new Error('Purchasing not initialized');

    return this.service.paymentPO(id, dto).pipe(
      tap(detail => {
        this.purchasingSubject.next(detail);
      })
    );
  }
}
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleStockItemDetail } from './sale-stock-item-detail';

describe('SaleStockItemDetail', () => {
    let component: SaleStockItemDetail;
    let fixture: ComponentFixture<SaleStockItemDetail>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SaleStockItemDetail]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SaleStockItemDetail);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

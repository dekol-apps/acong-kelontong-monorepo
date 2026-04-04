import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleStockItem } from './sale-stock-item';

describe('SaleStockItem', () => {
    let component: SaleStockItem;
    let fixture: ComponentFixture<SaleStockItem>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SaleStockItem]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SaleStockItem);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

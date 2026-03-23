import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleStock } from './sale-stock';

describe('SaleStock', () => {
    let component: SaleStock;
    let fixture: ComponentFixture<SaleStock>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SaleStock]
        })
            .compileComponents();

        fixture = TestBed.createComponent(SaleStock);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

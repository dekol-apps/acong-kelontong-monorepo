import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovementItemDetail } from './inventory-movement-item-detail';

describe('InventoryMovementItemDetail', () => {
    let component: InventoryMovementItemDetail;
    let fixture: ComponentFixture<InventoryMovementItemDetail>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InventoryMovementItemDetail]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InventoryMovementItemDetail);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

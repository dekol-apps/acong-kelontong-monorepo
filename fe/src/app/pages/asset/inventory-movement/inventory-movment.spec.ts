import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovement } from './inventory-movement';

describe('InventoryMovement', () => {
    let component: InventoryMovement;
    let fixture: ComponentFixture<InventoryMovement>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InventoryMovement]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InventoryMovement);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

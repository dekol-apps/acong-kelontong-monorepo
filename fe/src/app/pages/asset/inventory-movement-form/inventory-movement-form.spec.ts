import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovementForm } from './inventory-movement-form';

describe('InventoryMovementForm', () => {
    let component: InventoryMovementForm;
    let fixture: ComponentFixture<InventoryMovementForm>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InventoryMovementForm]
        })
            .compileComponents();

        fixture = TestBed.createComponent(InventoryMovementForm);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

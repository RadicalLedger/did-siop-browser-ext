import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddKeyComponent } from './add-key.component';

describe('AddKeyComponent', () => {
    let component: AddKeyComponent;
    let fixture: ComponentFixture<AddKeyComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddKeyComponent]
        });
        fixture = TestBed.createComponent(AddKeyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

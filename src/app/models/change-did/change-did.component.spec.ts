import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDidComponent } from './change-did.component';

describe('ChangeDidComponent', () => {
    let component: ChangeDidComponent;
    let fixture: ComponentFixture<ChangeDidComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChangeDidComponent]
        });
        fixture = TestBed.createComponent(ChangeDidComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

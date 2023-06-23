import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRequestComponent } from './confirm-request.component';

describe('ConfirmRequestComponent', () => {
    let component: ConfirmRequestComponent;
    let fixture: ComponentFixture<ConfirmRequestComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmRequestComponent]
        });
        fixture = TestBed.createComponent(ConfirmRequestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

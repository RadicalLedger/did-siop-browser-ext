import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeProfileInfoModalComponent } from './change-profile-info-modal.component';

describe('ChangeProfileInfoModalComponent', () => {
    let component: ChangeProfileInfoModalComponent;
    let fixture: ComponentFixture<ChangeProfileInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChangeProfileInfoModalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ChangeProfileInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

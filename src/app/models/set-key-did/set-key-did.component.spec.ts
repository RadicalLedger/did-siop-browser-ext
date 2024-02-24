import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetKeyDidComponent } from './set-key-did.component';

describe('SetKeyDidComponent', () => {
    let component: SetKeyDidComponent;
    let fixture: ComponentFixture<SetKeyDidComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SetKeyDidComponent]
        });
        fixture = TestBed.createComponent(SetKeyDidComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

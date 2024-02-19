import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolveDidComponent } from './resolve-did.component';

describe('ResolveDidComponent', () => {
    let component: ResolveDidComponent;
    let fixture: ComponentFixture<ResolveDidComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResolveDidComponent]
        });
        fixture = TestBed.createComponent(ResolveDidComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

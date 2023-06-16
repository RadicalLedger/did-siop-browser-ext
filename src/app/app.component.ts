import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    loggedIn: boolean = false;

    constructor(private changeDetector: ChangeDetectorRef) {}

    setLoginState(state: boolean) {
        this.loggedIn = state;
        this.changeDetector.detectChanges();
    }
}

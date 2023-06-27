import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {
    @Output() onLogout = new EventEmitter<boolean>();

    currentActive = 'home';

    constructor(private changeDetector: ChangeDetectorRef) {}

    onSelect(state: string) {
        this.currentActive = state;
        this.changeDetector.detectChanges();
    }

    logout() {
        this.onLogout.emit(true);
    }
}

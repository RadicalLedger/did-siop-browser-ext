import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {
    currentActive = 'settings';

    constructor(private changeDetector: ChangeDetectorRef) {}

    onSelect(state: string) {
        this.currentActive = state;
        this.changeDetector.detectChanges();
    }
}

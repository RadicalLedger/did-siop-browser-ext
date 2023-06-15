import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-guides',
    templateUrl: './guides.component.html',
    styleUrls: ['./guides.component.scss']
})
export class GuidesComponent {
    @Output() onBack = new EventEmitter<boolean>();

    onGoBack() {
        this.onBack.emit(true);
    }
}

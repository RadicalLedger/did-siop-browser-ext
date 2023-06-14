import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
    @Output() onBack = new EventEmitter<boolean>();

    onGoBack() {
        this.onBack.emit(true);
    }
}

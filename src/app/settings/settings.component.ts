import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    @Output() onProfile = new EventEmitter<boolean>();

    onSelectProfile() {
        this.onProfile.emit(true);
    }
}

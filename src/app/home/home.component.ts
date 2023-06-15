import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    @Output() onGuides = new EventEmitter<boolean>();

    onSelectGuides() {
        this.onGuides.emit(true);
    }
}

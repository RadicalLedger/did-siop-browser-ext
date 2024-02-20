import { Component } from '@angular/core';

@Component({
    selector: 'app-add-key',
    templateUrl: './add-key.component.html',
    styleUrls: ['./add-key.component.scss']
})
export class AddKeyComponent {
    ngOnInit(): void {
        /* reset form values */
        (document.getElementById('add-key-value') as HTMLInputElement).value = '';
    }
}

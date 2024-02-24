import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-set-key-did',
    templateUrl: './set-key-did.component.html',
    styleUrls: ['./set-key-did.component.scss']
})
export class SetKeyDidComponent {
    @Input() data: SetKeyDIDData = { type: '', key: '', chain_code: '', did: '' };
}

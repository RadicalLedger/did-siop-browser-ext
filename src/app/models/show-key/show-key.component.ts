import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-show-key',
    templateUrl: './show-key.component.html',
    styleUrls: ['./show-key.component.scss']
})
export class ShowKeyComponent implements OnInit {
    @Input() data: SigningKeys = { kid: '', key: '' };

    ngOnInit(): void {
        console.log(this.data);
    }
}

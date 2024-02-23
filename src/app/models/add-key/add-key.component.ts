import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { BackgroundMessageService } from 'src/app/services/message.service';
import { TASKS } from 'src/utils/tasks';

@Component({
    selector: 'app-add-key',
    templateUrl: './add-key.component.html',
    styleUrls: ['./add-key.component.scss']
})
export class AddKeyComponent {
    @ViewChild('didPathType') didPathTypeRef: ElementRef;

    index: 0 | 1 = 0;
    didPath: string = '';
    didAddress: string = '';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit(): void {
        /* reset form values */
        (document.getElementById('add-key-value') as HTMLInputElement).value = '';
        (document.getElementById('resolve-did-didPathType') as HTMLInputElement).value = 'custom';
        (document.getElementById('resolve-did-didPath') as HTMLInputElement).value = '';
        (document.getElementById('resolve-did-didAddress') as HTMLInputElement).value = '';
    }

    onSelectChange($event) {
        this.didPath = $event.target.value;
        this.didAddress = '';

        let values = {
            mnemonic: (document.getElementById('add-key-mnemonic') as HTMLInputElement).checked,
            private_key: (document.getElementById('add-key-private') as HTMLInputElement).checked,
            key: (document.getElementById('add-key-value') as HTMLInputElement).value
        };

        if (this.didPath) {
            this.messageService.sendMessage(
                {
                    task: TASKS.RESOLVE_KEY,
                    didPath: this.didPath,
                    keyString: values.key,
                    type: values?.mnemonic ? 'mnemonic' : 'private-key'
                },
                (result, error) => {
                    console.log(result, error);
                    this.didAddress = result || '';
                    this.changeDetector.detectChanges();
                }
            );
        } else {
            this.changeDetector.detectChanges();
        }
    }

    onPathChange($event) {
        let value = $event.target.value;

        this.didPath = value === 'custom' ? '' : value;
        this.didPathTypeRef.nativeElement.value = 'custom';

        let values = {
            mnemonic: (document.getElementById('add-key-mnemonic') as HTMLInputElement).checked,
            private_key: (document.getElementById('add-key-private') as HTMLInputElement).checked,
            key: (document.getElementById('add-key-value') as HTMLInputElement).value
        };

        if (value) {
            this.messageService.sendMessage(
                {
                    task: TASKS.RESOLVE_KEY,
                    didPath: value,
                    keyString: values.key,
                    type: values?.mnemonic ? 'mnemonic' : 'private-key'
                },
                (result, error) => {
                    this.didAddress = result || '';
                    this.changeDetector.detectChanges();
                }
            );
        } else {
            this.didAddress = '';
            this.changeDetector.detectChanges();
        }
    }
}

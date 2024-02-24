import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BackgroundMessageService } from 'src/app/services/message.service';
import { TASKS } from 'src/utils/tasks';

@Component({
    selector: 'app-resolve-did',
    templateUrl: './resolve-did.component.html',
    styleUrls: ['./resolve-did.component.scss']
})
export class ResolveDidComponent {
    chainCode: string = '';
    didAddress: string = '';

    @Input() data: ResolveKeyData = { type: '', key: '' };

    @ViewChild('chainCodeType') chainCodeTypeRef: ElementRef;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit(): void {
        /* reset form values */
        (document.getElementById('resolve-did-chainCodeType') as HTMLInputElement).value = 'custom';
        (document.getElementById('resolve-did-chainCode') as HTMLInputElement).value = '';
        (document.getElementById('resolve-did-didAddress') as HTMLInputElement).value = '';
    }

    onSelectChange($event) {
        this.chainCode = $event.target.value;
        this.didAddress = '';

        if (this.chainCode) {
            this.resolveDID(this.chainCode);
        } else {
            this.changeDetector.detectChanges();
        }
    }

    onPathChange($event) {
        let value = $event.target.value;
        this.chainCode = value === 'custom' ? '' : value;
        this.chainCodeTypeRef.nativeElement.value = 'custom';

        if (value) {
            this.resolveDID(value);
        } else {
            this.didAddress = '';
            this.changeDetector.detectChanges();
        }
    }

    /* resolve DID and set values */
    private resolveDID(chainCode) {
        this.messageService.sendMessage(
            {
                task: TASKS.RESOLVE_KEY,
                chainCode: chainCode,
                keyString: this.data.key,
                type: this.data.type
            },
            (result, error) => {
                console.log(result, error);
                this.didAddress = result || '';
                this.changeDetector.detectChanges();
            }
        );
    }
}

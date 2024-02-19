import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { BackgroundMessageService } from 'src/app/services/message.service';
import { TASKS } from 'src/utils/tasks';

@Component({
    selector: 'app-resolve-did',
    templateUrl: './resolve-did.component.html',
    styleUrls: ['./resolve-did.component.scss']
})
export class ResolveDidComponent {
    didPath: string = '';
    didAddress: string = '';

    @Input() data: ResolveKeyData = { type: '', key: '' };

    @ViewChild('didPathType') didPathTypeRef: ElementRef;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit(): void {}

    onSelectChange($event) {
        this.didPath = $event.target.value;
        this.didAddress = '';

        if (this.didPath) {
            this.messageService.sendMessage(
                {
                    task: TASKS.RESOLVE_KEY,
                    didPath: this.didPath,
                    keyString: this.data.key,
                    type: this.data.type
                },
                (result, error) => {
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
        this.didPath = value;
        this.didPathTypeRef.nativeElement.value = 'custom';

        if (value) {
            this.messageService.sendMessage(
                {
                    task: TASKS.RESOLVE_KEY,
                    didPath: value,
                    keyString: this.data.key,
                    type: this.data.type
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

import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BackgroundMessageService } from 'src/app/services/message.service';
import { TASKS } from 'src/utils/tasks';

interface CurrentVP {
    index: string | number;
    title: string;
    vp: any;
}

interface DataProps {
    vp_token?: any;
    response?: {
        vp_token?: any;
        _vp_token?: any;
    };
}

@Component({
    selector: 'app-confirm-request',
    templateUrl: './confirm-request.component.html',
    styleUrls: ['./confirm-request.component.scss']
})
export class ConfirmRequestComponent implements OnInit {
    @Input() data: DataProps = {};

    @ViewChild('requestVpTokenTxtEl') requestVpTokenTxtEl: ElementRef;
    @ViewChild('vpTokenTxtEl') vpTokenTxtEl: ElementRef;

    vpListActive: boolean = false;
    currentVPs: CurrentVP[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit(): void {
        this.loadVPs();
    }

    getJSONFormatted(value: any) {
        return JSON.stringify(value || {}, null, 4);
    }

    onVPSelect(data: CurrentVP) {
        this.vpTokenTxtEl.nativeElement.value = JSON.stringify(data.vp, null, 4);
        this.vpListActive = false;
        this.changeDetector.detectChanges();
    }

    onSelectVPState(state: boolean) {
        this.vpListActive = state;
        this.changeDetector.detectChanges();
    }

    private loadVPs() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_VPS
            },
            (result) => {
                if (result) {
                    this.currentVPs = result;
                    this.changeDetector.detectChanges();
                }
            }
        );
    }
}

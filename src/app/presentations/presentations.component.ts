import {
    Component,
    OnInit,
    EventEmitter,
    Output,
    ChangeDetectorRef,
    ViewChild,
    ElementRef
} from '@angular/core';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';
import { TASKS } from 'src/const';
import { BackgroundMessageService } from '../background-message.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-presentations',
    templateUrl: './presentations.component.html',
    styleUrls: ['./presentations.component.scss']
})
export class PresentationsComponent implements OnInit {
    @ViewChild('modalInfo') modalInfo: ElementRef;
    @ViewChild('modalCreate') modalCreate: ElementRef;

    currentDID: any;
    currentVPs: any[];
    selected: any = {};

    constructor(
        private changeDetector: ChangeDetectorRef,
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService
    ) {
        this.loadIdentity();
        this.loadVPs();
    }

    @Output() clickedBack = new EventEmitter<boolean>();

    ngOnInit(): void {}

    goBack() {
        this.clickedBack.emit(true);
    }

    removePresentation(i: number) {
        this.messageService.sendMessage(
            {
                task: TASKS.REMOVE_VP,
                index: i
            },
            (response) => {
                if (response.vps) {
                    this.currentVPs = response.vps;
                } else {
                    this.currentVPs = [];
                }
                this.changeDetector.detectChanges();
            }
        );
    }

    async shareVPs() {
        let verifiablePresentations = [];
        Object.entries(this.selected).forEach(([key, value]) => {
            if (value) {
                const vp_data = this.currentVPs.find((item: any) => item.index === key);
                if (vp_data) verifiablePresentations.push(vp_data.vp);
            }
        });

        //share presentations
    }

    private loadVPs() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_VPS
            },
            (response) => {
                // console.log(response);
                if (response.vps) {
                    this.currentVPs = response.vps;
                } else {
                    this.currentVPs = [];
                }
                this.changeDetector.detectChanges();
            }
        );
    }

    private loadIdentity() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (response) => {
                if (response.did) {
                    this.currentDID = response.did;
                } else {
                    this.currentDID = 'No DID provided';
                }
                this.changeDetector.detectChanges();
            }
        );
    }
}

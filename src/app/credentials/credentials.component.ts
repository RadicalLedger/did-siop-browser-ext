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
    selector: 'app-credentials',
    templateUrl: './credentials.component.html',
    styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
    @ViewChild('modalInfo') modalInfo: ElementRef;
    @ViewChild('modalCreate') modalCreate: ElementRef;

    currentDID: any;
    currentVCs: any[];
    selected: any = {};

    constructor(
        private changeDetector: ChangeDetectorRef,
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService
    ) {
        this.loadIdentity();
        this.loadVCs();
    }

    @Output() clickedBack = new EventEmitter<boolean>();

    ngOnInit(): void {}

    goBack() {
        this.clickedBack.emit(true);
    }

    removeCredential(i: number) {
        this.messageService.sendMessage(
            {
                task: TASKS.REMOVE_VC,
                index: i
            },
            (response) => {
                if (response.vcs) {
                    this.currentVCs = response.vcs;
                } else {
                    this.currentVCs = [];
                }
                this.changeDetector.detectChanges();
            }
        );
    }

    async createVP() {
        let verifiableCredentials = [];
        Object.entries(this.selected).forEach(([key, value]) => {
            if (value) {
                const vc_data = this.currentVCs.find((item: any) => item.index == key);
                if (vc_data) verifiableCredentials.push(vc_data.vc);
            }
        });

        this.modalInfo.nativeElement.classList.remove('error');
        this.modalInfo.nativeElement.classList.add('waiting');
        this.modalInfo.nativeElement.innerText = 'Please wait';
        this.modalCreate.nativeElement.disabled = true;

        try {
            const vp: any = await axios({
                method: 'POST',
                url: `${environment.micro_api}reward/presentation/generate`,
                data: {
                    did: this.currentDID,
                    rewards: verifiableCredentials
                }
            });

            this.modalInfo.nativeElement.innerText = '';
            this.modalInfo.nativeElement.classList.remove('waiting');
            this.modalCreate.nativeElement.disabled = false;

            if (!vp?.data?.verifiablePresentation) {
                this.modalInfo.nativeElement.innerText = 'Failed  to create VP';
                this.modalInfo.nativeElement.classList.add('error');
                return;
            }

            this.messageService.sendMessage(
                {
                    task: TASKS.ADD_VP,
                    vp: btoa(JSON.stringify(vp?.data?.verifiablePresentation))
                },
                (response) => {
                    if (response.result) {
                        this.toastrService.success('VP created', 'DID_SIOP', {
                            onActivateTick: true,
                            positionClass: 'toast-bottom-center'
                        });
                    } else if (response.err) {
                        this.modalInfo.nativeElement.innerText = 'Failed to save VP';
                        this.modalInfo.nativeElement.classList.add('error');
                    }
                }
            );
        } catch (error) {
            this.modalInfo.nativeElement.innerText = error.message;
            this.modalInfo.nativeElement.classList.remove('waiting');
            this.modalInfo.nativeElement.classList.add('error');
            this.modalCreate.nativeElement.disabled = false;
        }
    }

    private loadVCs() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_VCS
            },
            (response) => {
                if (response.vcs) {
                    this.currentVCs = response.vcs;
                } else {
                    this.currentVCs = [];
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

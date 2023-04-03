import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackgroundMessageService } from 'src/app/background-message.service';
import { IdentityService } from 'src/app/identity.service';
import { TASKS } from 'src/const';

@Component({
    selector: 'test-data-modal',
    templateUrl: './test-data-modal.component.html',
    styleUrls: ['./test-data-modal.component.scss', '../modals.common.scss']
})
export class TestDataModalComponent implements OnInit {
    @ViewChild('modalClose') modalClose: ElementRef;
    @ViewChild('modalInfo') modalInfo: ElementRef;
    @ViewChild('modalYes') modalYes: ElementRef;
    @ViewChild('modalOpen') modalOpen: ElementRef;

    @Output() didChanged = new EventEmitter<boolean>();

    constructor(
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService,
        private identityService: IdentityService
    ) {}

    ngOnInit(): void {}

    open() {
        this.modalInfo.nativeElement.innerText = '';
        this.modalOpen.nativeElement.click();
    }

    async initializeTestData() {
        this.modalInfo.nativeElement.classList.remove('error');
        this.modalInfo.nativeElement.classList.add('waiting');
        this.modalInfo.nativeElement.innerText = 'Please wait';
        this.modalClose.nativeElement.disabled = true;
        this.modalYes.nativeElement.disabled = true;

        // let did = 'did:key:z6MkvEoFWxZ9B5RDGSTLo2MqE3YJTxrDfLLZyZKjFRtcUSyw';
        let did = 'did:ethr:0xc8e79464833A7D5cf050A82FfAde54A3c6F982D9';
        if (did) {
            this.messageService.sendMessage(
                {
                    task: TASKS.CHANGE_DID,
                    did: did
                },
                (response) => {
                    if (response.result) {
                        this.identityService.setCurrentDID(did);
                        // let keyString = 'zrv1xdp8ZsfXSDh4fQp8sE2VYPmLiCL3RssjKeXW7fYrRkxyWpWR5ugcC36WrCx9FizbJvxdwFmYcq7YxRVC2nVPFp5';
                        let keyString =
                            '2d59f69e38ae89bed0e6321cd62b29dd89c37d06748ee9f5a7084e31767d8887';

                        this.messageService.sendMessage(
                            {
                                task: TASKS.ADD_KEY,
                                keyInfo: keyString
                            },
                            (response) => {
                                if (response.result) {
                                    this.identityService.setSigningInfoSet([
                                        { kid: response.result }
                                    ]);
                                    this.modalClose.nativeElement.disabled = false;
                                    this.modalYes.nativeElement.disabled = false;
                                    this.didChanged.emit(true);
                                    this.modalClose.nativeElement.click();
                                    this.toastrService.success('Successful', 'DID_SIOP', {
                                        onActivateTick: true,
                                        positionClass: 'toast-bottom-center'
                                    });
                                } else if (response.err) {
                                    this.modalInfo.nativeElement.innerText = response.err;
                                    this.modalInfo.nativeElement.classList.remove('waiting');
                                    this.modalInfo.nativeElement.classList.add('error');
                                    this.modalClose.nativeElement.disabled = false;
                                    this.modalYes.nativeElement.disabled = false;
                                }
                            }
                        );
                    } else if (response.err) {
                        this.modalInfo.nativeElement.innerText = response.err;
                        this.modalInfo.nativeElement.classList.remove('waiting');
                        this.modalInfo.nativeElement.classList.add('error');
                        this.modalClose.nativeElement.disabled = false;
                        this.modalYes.nativeElement.disabled = false;
                    }
                }
            );
        } else {
            this.modalInfo.nativeElement.classList.remove('waiting');
            this.modalInfo.nativeElement.classList.add('error');
            this.modalClose.nativeElement.disabled = false;
            this.modalYes.nativeElement.disabled = false;
        }
    }
}

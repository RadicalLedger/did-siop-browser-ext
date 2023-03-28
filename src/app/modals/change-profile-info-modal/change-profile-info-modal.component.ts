import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackgroundMessageService } from 'src/app/background-message.service';
import { IdentityService } from 'src/app/identity.service';
import { TASKS } from 'src/const';
import utils from 'src/utils';

@Component({
    selector: 'change-profile-info-modal',
    templateUrl: './change-profile-info-modal.component.html',
    styleUrls: ['./change-profile-info-modal.component.scss', '../modals.common.scss']
})
export class ChangeProfileInfoModalComponent implements OnInit {
    @ViewChild('titleValue') titleValue: ElementRef;
    @ViewChild('newValue') newValue: ElementRef;
    @ViewChild('modalClose') modalClose: ElementRef;
    @ViewChild('modalInfo') modalInfo: ElementRef;
    @ViewChild('modalYes') modalYes: ElementRef;
    @ViewChild('modalOpen') modelOpen: ElementRef;

    @Output() dataChanged = new EventEmitter<boolean>();

    changeType: string;

    constructor(
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService,
        private identityService: IdentityService
    ) {}

    ngOnInit(): void {}

    open(type: string) {
        switch (type) {
            case 'email':
                this.titleValue.nativeElement.innerText = 'Change Email Value';
                break;
            case 'name':
                this.titleValue.nativeElement.innerText = 'Change Name Value';
                break;

            default:
                break;
        }

        this.changeType = type;
        this.modalInfo.nativeElement.innerText = '';
        this.newValue.nativeElement.value = '';
        this.modelOpen.nativeElement.click();
    }

    changeValue(value: any) {
        this.modalInfo.nativeElement.classList.remove('error');
        this.modalInfo.nativeElement.classList.add('waiting');
        this.modalInfo.nativeElement.innerText = 'Please wait';
        this.modalClose.nativeElement.disabled = true;
        this.modalYes.nativeElement.disabled = true;

        if (this.changeType === 'email') {
            if (!utils.validateEmail(value)) value = false;
        }

        if (value) {
            this.messageService.sendMessage(
                {
                    task: TASKS.CHANGE_PROFILE_INFO,
                    data: {
                        type: this.changeType,
                        value
                    }
                },
                (response) => {
                    if (response.result) {
                        /* set the current values to the identity object */
                        if (this.changeType === 'email') {
                            this.identityService.setCurrentEmail(value);
                        }
                        if (this.changeType === 'name') {
                            this.identityService.setCurrentName(value);
                        }

                        this.newValue.nativeElement.value = '';
                        this.modalInfo.nativeElement.classList.remove('waiting');
                        this.modalClose.nativeElement.disabled = false;
                        this.modalYes.nativeElement.disabled = false;
                        this.modalClose.nativeElement.click();
                        this.dataChanged.emit(true);
                        this.toastrService.success(response.result, 'DID_SIOP', {
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
        } else {
            this.modalInfo.nativeElement.innerText = 'Please enter a valid value';
            this.modalInfo.nativeElement.classList.remove('waiting');
            this.modalInfo.nativeElement.classList.add('error');
            this.modalClose.nativeElement.disabled = false;
            this.modalYes.nativeElement.disabled = false;
        }
    }
}

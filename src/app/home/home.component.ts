import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';
import { PopupService } from '../services/popup.service';
import sampleResponseVPData from './response-vp_data.json';
import Swal from 'sweetalert2';

interface CurrentRequest {
    client_id: string;
    index: number;
    request: any;
}

interface CurrentProfile {
    name: string;
    email: string;
    nickname: string;
    image: string;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @Output() onGuides = new EventEmitter<boolean>();

    currentRequests: CurrentRequest[];
    currentDID: string;
    currentProfile: CurrentProfile;
    profileImage: string = 'assets/avatar.png';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    onSelectGuides() {
        this.onGuides.emit(true);
    }

    ngOnInit(): void {
        this.loadIdentity();
        this.loadRequests();
    }

    onSelectRequest(data: CurrentRequest) {
        try {
            let token = data.request.split('request=');
            let decoded = this.parseJwt(token[1]);

            let idTokenData = decoded.claims.id_token || {};
            let vpResponseData = { vp_token: null, _vp_token: null };

            /* set values to id token attributes in claims */
            for (const key in idTokenData) {
                if (key == 'did') idTokenData[key] = this.currentDID;
                else if (this.currentProfile?.[key]) idTokenData[key] = this.currentProfile?.[key];
            }

            if (decoded.claims.vp_token) vpResponseData = sampleResponseVPData;

            /* if claims include vp_token */
            this.popupService
                .show({
                    title: 'Confirm Request',
                    text: `Confirm login to ${data.client_id}`,
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    denyButtonText: 'Deny',
                    showDenyButton: true,
                    showCancelButton: true,
                    showLoaderOnConfirm: true,
                    allowOutsideClick: () => !Swal.isLoading(),
                    preConfirm: () => {
                        return new Promise((resolve, reject) => {
                            this.messageService.sendMessage(
                                {
                                    task: TASKS.PROCESS_REQUEST,
                                    confirmed: true,
                                    index: data.index,
                                    id_token: idTokenData,
                                    vp_data: vpResponseData
                                },
                                (result, error) => {
                                    console.log({ result, error });
                                    if (error) {
                                        this.popupService.show({
                                            icon: 'error',
                                            title: 'Failed',
                                            text: error || 'Failed to accept the request'
                                        });
                                        return resolve(false);
                                    }

                                    resolve(undefined);
                                }
                            );
                        });
                    },
                    preDeny: () => {
                        return new Promise((resolve, reject) => {
                            this.messageService.sendMessage(
                                {
                                    task: TASKS.PROCESS_REQUEST,
                                    confirmed: false,
                                    index: data.index
                                },
                                (result, error) => {
                                    if (error) {
                                        this.popupService.show({
                                            icon: 'error',
                                            title: 'Failed',
                                            text: error || 'Failed to deny the request'
                                        });
                                        return resolve(false);
                                    }

                                    resolve(undefined);
                                }
                            );
                        });
                    }
                })
                .then((result) => {
                    // (document.getElementById('new-did-value') as HTMLInputElement).value = '';
                    this.loadRequests();
                });
        } catch (error) {
            this.popupService
                .show({
                    icon: 'error',
                    title: 'Oops',
                    text: error?.message || 'Something went wrong',
                    confirmButtonText: 'Ok',
                    denyButtonText: 'Remove',
                    showDenyButton: true,
                    showCancelButton: false,
                    showLoaderOnConfirm: true,
                    allowOutsideClick: () => !Swal.isLoading(),
                    preDeny: () => {
                        return new Promise((resolve, reject) => {
                            this.messageService.sendMessage(
                                {
                                    task: TASKS.REMOVE_REQUEST,
                                    index: data.index
                                },
                                (result, error) => {
                                    if (error) {
                                        this.popupService.show({
                                            icon: 'error',
                                            title: 'Failed',
                                            text: error || 'Failed to remove the request'
                                        });
                                        return resolve(false);
                                    }

                                    resolve(undefined);
                                }
                            );
                        });
                    }
                })
                .then((result) => {
                    this.loadRequests();
                });
        }
    }

    private parseJwt(token: string) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }

    private loadIdentity() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (result) => {
                if (result) {
                    let profile = result?.profile;

                    if (profile) this.currentProfile = profile;

                    if (profile?.image) this.profileImage = profile.image;

                    if (result.did) this.currentDID = result.did;

                    this.changeDetector.detectChanges();
                }
            }
        );
    }

    private loadRequests() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_REQUESTS
            },
            (result) => {
                if (result) {
                    this.currentRequests = result;
                    this.changeDetector.detectChanges();
                }
            }
        );
    }
}

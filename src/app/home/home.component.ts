import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';
import { PopupService } from '../services/popup.service';
import sampleResponseVPData from './response-vp_data.json';
import Swal from 'sweetalert2';
import _ from 'lodash';
import utils from 'src/utils';

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

interface ConfirmRequest {
    vp_token?: any;
    response?: {
        vp_token?: any;
        _vp_token?: any;
    };
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @Output() onGuides = new EventEmitter<boolean>();

    @ViewChild('confirmRequest') confirmRequest: ElementRef;

    currentRequests: CurrentRequest[];
    currentDID: string;
    currentProfile: CurrentProfile;
    profileImage: string = 'assets/avatar.png';
    confirmRequestData: ConfirmRequest = {};

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

            if (decoded.claims.vp_token) {
                vpResponseData = sampleResponseVPData;

                this.confirmRequestData = {
                    vp_token: decoded.claims.vp_token,
                    response: vpResponseData
                };
                this.changeDetector.detectChanges();
            }

            /* if claims include vp_token */
            this.popupService
                .show({
                    title: 'Confirm Request',
                    text: `Confirm login to ${data.client_id}`,
                    html: decoded.claims.vp_token ? this.confirmRequest.nativeElement : undefined,
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    denyButtonText: 'Deny',
                    showDenyButton: true,
                    showCancelButton: true,
                    showLoaderOnConfirm: true,
                    showLoaderOnDeny: true,
                    allowOutsideClick: () => !Swal.isLoading(),
                    preConfirm: () => {
                        return new Promise((resolve, reject) => {
                            if (decoded.claims.vp_token) {
                                let vp_token = (
                                    document.getElementById('vp_token-txt') as HTMLInputElement
                                ).value;
                                let _vp_token = (
                                    document.getElementById('_vp_token-txt') as HTMLInputElement
                                ).value;

                                if (!vp_token) {
                                    Swal.showValidationMessage('"vp_token" is required');
                                    return resolve(false);
                                }
                                if (!_vp_token) {
                                    Swal.showValidationMessage('"vp_token" is required');
                                    return resolve(false);
                                }
                                if (!utils.isJson(vp_token)) {
                                    Swal.showValidationMessage('"vp_token" is not a valid JSON');
                                    return resolve(false);
                                }
                                if (!utils.isJson(_vp_token)) {
                                    Swal.showValidationMessage('"_vp_token" is not a valid JSON');
                                    return resolve(false);
                                }

                                vpResponseData.vp_token = JSON.parse(vp_token);
                                vpResponseData._vp_token = JSON.parse(_vp_token);
                            }

                            this.messageService.sendMessage(
                                {
                                    task: TASKS.PROCESS_REQUEST,
                                    confirmed: true,
                                    index: data.index,
                                    id_token: idTokenData,
                                    vp_data: vpResponseData
                                },
                                (result, error) => {
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
                    this.currentRequests = _.orderBy(result, ['index'], 'desc');
                    this.changeDetector.detectChanges();
                }
            }
        );
    }
}

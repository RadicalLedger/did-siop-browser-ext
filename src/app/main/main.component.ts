import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TASKS } from 'src/const';
import { BackgroundMessageService } from '../background-message.service';
import SampleResponseVpData from './sample.response.vp_data.json';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {
    title = 'did-siop-ext';

    currentDID: string;
    currentRequests: any[];
    requestVpData: any[];
    responseVpTokenData: any;
    response_VpTokenData: any;

    selectedRequest: any;
    selectedRequestClientID: string;

    @ViewChild('requestModalClose') requestModalClose: ElementRef;
    @ViewChild('requestModalInfo') requestModalInfo: ElementRef;
    @ViewChild('requestModalYes') requestModalYes: ElementRef;
    @ViewChild('requestModalNo') requestModalNo: ElementRef;

    //request
    @ViewChild('requestVPData') requestVPData: ElementRef;
    @ViewChild('requestVPDataTxT') requestVPDataTxT: ElementRef;

    //response
    @ViewChild('responseVPData') responseVPData: ElementRef;
    // response vp_token
    @ViewChild('responseVPTokenDataTxT') responseVPTokenDataTxT: ElementRef;
    @ViewChild('responseVPTokenWarningDataTxT') responseVPTokenWarningDataTxT: ElementRef;
    // response _vp_token
    @ViewChild('response_VPTokenDataTxT') response_VPTokenDataTxT: ElementRef;
    @ViewChild('response_VPTokenWarningDataTxT') response_VPTokenWarningDataTxT: ElementRef;

    @Output() loggedOut = new EventEmitter<boolean>();

    displayMainContent: boolean = true;
    displaySettings: boolean = false;
    displayGuides: boolean = false;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService
    ) {
        this.loadIdentity();
        this.loadRequests();
    }

    logout() {
        this.messageService.sendMessage(
            {
                task: TASKS.LOGOUT
            },
            (response) => {
                if (response.result) {
                    this.loggedOut.emit(true);
                }
            }
        );
    }

    showMainContent() {
        this.displayMainContent = true;
        this.displayGuides = false;
        this.displaySettings = false;
        this.loadIdentity();
        this.changeDetector.detectChanges();
    }

    showGuides() {
        this.displayGuides = true;
        this.displayMainContent = false;
        this.displaySettings = false;
        this.changeDetector.detectChanges();
    }

    showSettings() {
        this.displaySettings = true;
        this.displayGuides = false;
        this.displayMainContent = false;
        this.changeDetector.detectChanges();
    }

    selectRequest(request: any) {
        this.requestModalInfo.nativeElement.innerHTML = '';
        this.requestModalInfo.nativeElement.classList.remove('error');
        this.requestModalInfo.nativeElement.classList.remove('waiting');

        this.requestModalYes.nativeElement.disabled = false;
        this.requestModalNo.nativeElement.disabled = false;
        this.requestModalClose.nativeElement.disabled = false;

        this.selectedRequest = request;
        this.selectedRequestClientID = this.selectedRequest.client_id;

        this.requestVpData = null;
        this.responseVpTokenData = null;
        this.response_VpTokenData = null;

        if (request.request) {
            try {
                let token = request.request.split('request=');
                let decode_request = this.parseJwt(token[1]);

                if (decode_request.claims?.vp_token) {
                    this.requestVpData = decode_request.claims.vp_token;
                    this.responseVpTokenData = SampleResponseVpData.vp_token;
                    this.response_VpTokenData = SampleResponseVpData._vp_token;

                    this.requestVPData.nativeElement.classList.add('active');
                    this.responseVPData.nativeElement.classList.add('active');
                } else {
                    this.requestVPData.nativeElement.classList.remove('active');
                    this.responseVPData.nativeElement.classList.remove('active');
                }
            } catch (error) {
                console.log({ error });
                this.requestVPData.nativeElement.classList.remove('active');
                this.responseVPData.nativeElement.classList.remove('active');
            }
        }

        this.changeDetector.detectChanges();
    }

    // request vp_token txt change
    get vpRequestTextAreaValue() {
        if (!this.requestVpData) return '{}';

        return JSON.stringify(this.requestVpData, null, 2);
    }

    set vpRequestTextAreaValue(v) {
        try {
            this.requestVpData = JSON.parse(v);
        } catch (e) {
            console.log('error occored while you were typing the JSON');
        }
    }

    // response vp_token txt change
    get vpTokenResponseTextAreaValue() {
        if (!this.responseVpTokenData) return '';

        return JSON.stringify(this.responseVpTokenData, null, 2);
    }

    set vpTokenResponseTextAreaValue(v) {
        try {
            this.responseVpTokenData = JSON.parse(v);
            this.responseVPTokenWarningDataTxT.nativeElement.classList.remove('active');
        } catch (e) {
            console.log('error occored while you were typing the JSON');
            this.responseVPTokenWarningDataTxT.nativeElement.classList.add('active');
        }
    }

    // response _vp_token txt change
    get _vpTokenResponseTextAreaValue() {
        if (!this.response_VpTokenData) return '';

        return JSON.stringify(this.response_VpTokenData, null, 2);
    }

    set _vpTokenResponseTextAreaValue(v) {
        try {
            this.response_VpTokenData = JSON.parse(v);
            this.response_VPTokenWarningDataTxT.nativeElement.classList.remove('active');
        } catch (e) {
            console.log('error occored while you were typing the JSON');
            this.response_VPTokenWarningDataTxT.nativeElement.classList.add('active');
        }
    }

    parseJwt(token: string) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }

    processRequest(confirmation: boolean) {
        this.requestModalYes.nativeElement.disabled = true;
        this.requestModalNo.nativeElement.disabled = true;
        this.requestModalClose.nativeElement.disabled = false;
        this.requestModalInfo.nativeElement.classList.add('waiting');
        this.requestModalInfo.nativeElement.innerHTML = 'Processing request. Please wait';

        this.messageService.sendMessage(
            {
                task: TASKS.PROCESS_REQUEST,
                did_siop_index: this.selectedRequest.index,
                confirmation: confirmation,
                vp_data: {
                    vp_token: this.responseVpTokenData,
                    _vp_token: this.response_VpTokenData
                }
            },
            (response) => {
                if (response.result) {
                    this.loadRequests();
                    this.requestModalClose.nativeElement.click();
                } else if (response.err) {
                    console.log('ERROR returned from background processRequest');
                    this.requestModalInfo.nativeElement.classList.remove('waiting');
                    this.requestModalInfo.nativeElement.classList.add('error');
                    this.requestModalInfo.nativeElement.innerHTML = response.err;
                    this.requestModalClose.nativeElement.disabled = false;
                } else {
                    console.log(
                        'Error returned from background - response.result & response.err are null'
                    );
                }
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

    private loadRequests() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_REQUESTS
            },
            (response) => {
                if (response.didSiopRequests) {
                    this.currentRequests = response.didSiopRequests;
                } else {
                    this.currentRequests = [];
                }
                this.changeDetector.detectChanges();
            }
        );
    }
}

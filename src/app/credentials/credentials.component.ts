import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import {
    Ed25519VerificationKey2018,
    Ed25519Signature2018
} from '@transmute/ed25519-signature-2018';
import { verifiable } from '@transmute/vc.js';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';
import { TASKS } from 'src/const';
import config from 'src/utils/config';
import documentLoader from 'src/utils/documentLoader';
import { BackgroundMessageService } from '../background-message.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-credentials',
    templateUrl: './credentials.component.html',
    styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
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
        // create a vp

        let verifiableCredentials = [];
        Object.entries(this.selected).forEach(([key, value]) => {
            if (value) {
                const vc_data = this.currentVCs.find((item: any) => item.index === key);
                if (vc_data) verifiableCredentials.push(vc_data.vc);
            }
        });

        const vp: any = await axios({
            method: 'POST',
            url: `${environment.micro_api}reward/presentation/generate`,
            data: {
                did: this.currentDID,
                rewards: verifiableCredentials
            }
        });

        console.log(vp);
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

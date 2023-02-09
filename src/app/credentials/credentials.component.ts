import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TASKS } from 'src/const';
import { BackgroundMessageService } from '../background-message.service';

@Component({
    selector: 'app-credentials',
    templateUrl: './credentials.component.html',
    styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent implements OnInit {
    currentVCs: any[];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService
    ) {
        this.loadVCs();
    }

    @Output() clickedBack = new EventEmitter<boolean>();

    ngOnInit(): void {}

    goBack() {
        this.clickedBack.emit(true);
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
}

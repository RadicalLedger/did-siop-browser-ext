import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import utils from 'src/utils';
import { TASKS } from 'src/utils/tasks';
import { BackgroundMessageService } from '../services/message.service';
import { PopupService } from '../services/popup.service';
import Swal from 'sweetalert2';

interface CurrentVP {
    index: string | number;
    title: string;
    vp: any;
}

@Component({
    selector: 'app-presentations',
    templateUrl: './presentations.component.html',
    styleUrls: ['./presentations.component.scss']
})
export class PresentationsComponent implements OnInit {
    currentVPs: CurrentVP[] = [];

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.loadVPs();
    }

    removeVP(index: string | number) {
        this.popupService
            .show({
                title: 'Confirm Request',
                text: `This verifiable presentation will be removed from the extension. Are you sure?`,
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        this.messageService.sendMessage(
                            {
                                task: TASKS.REMOVE_VP,
                                index
                            },
                            (result, error) => {
                                if (error) {
                                    this.popupService.show({
                                        icon: 'error',
                                        title: 'Failed',
                                        text: error || 'Failed to remove verifiable presentation'
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
                this.loadVPs();
            });
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

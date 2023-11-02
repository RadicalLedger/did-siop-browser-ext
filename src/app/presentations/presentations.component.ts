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
    selectedVP: CurrentVP = null;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.loadVPs();
    }

    downloadVP(index: string | number) {
        const vp_data = this.currentVPs.find((item: any) => item.index == index);
        let title = vp_data.title || 'Verifiable presentation';

        var element = document.createElement('a');
        var sJson = JSON.stringify(vp_data.vp, null, 4);
        element.setAttribute('href', 'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson));
        element.setAttribute('download', `${title}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
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

    onSelectVP(vp: CurrentVP) {
        this.selectedVP = vp;
        this.changeDetector.detectChanges();
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

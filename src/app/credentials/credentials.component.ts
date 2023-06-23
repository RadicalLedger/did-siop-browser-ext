import { ChangeDetectorRef, Component } from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { PopupService } from '../services/popup.service';
import { TASKS } from 'src/utils/tasks';
import utils from 'src/utils';
import Swal from 'sweetalert2';

interface CurrentVC {
    index: string | number;
    vc: any;
}

@Component({
    selector: 'app-credentials',
    templateUrl: './credentials.component.html',
    styleUrls: ['./credentials.component.scss']
})
export class CredentialsComponent {
    currentVCs: CurrentVC[];
    selectedVCs: any = {};

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.loadVCs();
    }

    getName(data: any) {
        return utils.getObjectValue(data.vc, 'title');
    }

    removeVC(index: string | number) {
        this.popupService
            .show({
                title: 'Confirm Request',
                text: `This verifiable credential will be removed from the extension. Are you sure?`,
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        this.messageService.sendMessage(
                            {
                                task: TASKS.REMOVE_VC,
                                index
                            },
                            (result, error) => {
                                if (error) {
                                    this.popupService.show({
                                        icon: 'error',
                                        title: 'Failed',
                                        text: error || 'Failed to remove verifiable credential'
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
                this.loadVCs();
            });
    }

    createPresentation() {
        let vcs = [];
        Object.entries(this.selectedVCs).forEach(([key, value]) => {
            if (value) {
                const vc_data = this.currentVCs.find((item: any) => item.index == key);
                if (vc_data) vcs.push(vc_data.vc);
            }
        });

        if (vcs.length === 0) {
            this.popupService.show({
                icon: 'warning',
                title: 'Oops',
                text: 'Please select at least one verifiable credential to create a verifiable presentation'
            });
            return;
        }

        this.popupService
            .show({
                title: 'Create Presentation',
                input: 'text',
                inputPlaceholder: 'Presentation Title',
                text: `A verifiable presentation will be created with the selected ${vcs.length} number of verifiable credentials`,
                confirmButtonText: 'Create',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: (title) => {
                    return new Promise((resolve, reject) => {
                        if (!title) {
                            Swal.showValidationMessage('Failed to add new DID key');
                            return resolve(false);
                        }

                        this.messageService.sendMessage(
                            {
                                task: TASKS.CREATE_VP,
                                title,
                                vcs
                            },
                            (result, error) => {
                                if (error) {
                                    this.popupService.show({
                                        icon: 'error',
                                        title: 'Failed',
                                        text: error || 'Failed to create verifiable presentation'
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
                if (result.isConfirmed) {
                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'Verifiable presentation has been created. Please check the presentations tab.'
                    });
                }
            });
    }

    private loadVCs() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_VCS
            },
            (result) => {
                if (result) {
                    this.currentVCs = result;
                    this.changeDetector.detectChanges();
                }
            }
        );
    }
}

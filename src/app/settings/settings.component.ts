import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild
} from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';
import Swal from 'sweetalert2';
import { PopupService } from '../services/popup.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    @Output() onProfile = new EventEmitter<boolean>();

    @ViewChild('changePasswordEl', { static: false }) changePasswordEl: ElementRef;
    @ViewChild('addNewKeyEl', { static: false }) addNewKeyEl: ElementRef;

    currentDID: string = '';
    currentKeys: SigningKeys[] = [];
    profileImage: string = 'assets/avatar.png';
    name: string = 'Unknown';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.setIdentity();
    }

    onSelectProfile() {
        this.onProfile.emit(true);
    }

    /* test keys setup */
    onTestKeys() {
        this.popupService
            .show({
                title: 'Initialize Test Data',
                text: 'Initialize Identity with test data. Warning! This will remove current DID and all the related keys. Are you sure?',
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        this.messageService.sendMessage(
                            {
                                task: TASKS.CHANGE_DID,
                                did: 'did:key:z6MkswmCzzSLJEq5AM2EU9zDaoi7fLq7nLQVTX3qWj77ymJe'
                            },
                            (result, error) => {
                                if (error) {
                                    Swal.showValidationMessage('Failed to add new DID key');
                                    throw resolve(undefined);
                                }

                                this.messageService.sendMessage(
                                    {
                                        task: TASKS.ADD_KEY,
                                        keyString:
                                            '861dc015d9edb888e6d9981b7e9c0dd86748efbe539e4a065ffb59f8cdbb096c'
                                    },
                                    (result, error) => {
                                        if (error) {
                                            throw new Error('Failed to add the singing key');
                                        }

                                        this.setIdentity();

                                        return resolve(true);
                                    }
                                );
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
                        text: 'Test DID and Signing Key added successfully'
                    });
                }
            });
    }

    setIdentity() {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (result) => {
                if (result) {
                    let profile = result?.profile;

                    if (profile?.name) this.name = profile.name;
                    if (profile?.image) this.profileImage = profile.image;

                    if (result.did) this.currentDID = result.did;
                    if (result.keys) this.currentKeys = result.keys;

                    this.changeDetector.detectChanges();
                }
            }
        );
    }

    onSelectKey(data?: { key?: string; kid?: string }) {
        this.popupService
            .show({
                title: 'Signing Key',
                text: data.kid,
                showConfirmButton: false,
                showDenyButton: true,
                showCancelButton: true,
                denyButtonText: 'Remove'
            })
            .then((result) => {
                if (result.isDenied) {
                    this.popupService
                        .show({
                            icon: 'warning',
                            title: 'Remove Key',
                            text: 'You are about to remove key.This cannot be undone. Are you sure?',
                            showConfirmButton: true,
                            showCancelButton: true,
                            confirmButtonText: 'Yes',
                            cancelButtonText: 'No'
                        })
                        .then((removeResult) => {
                            if (removeResult.isConfirmed) {
                                this.messageService.sendMessage(
                                    {
                                        task: TASKS.REMOVE_KEY,
                                        kid: data.kid
                                    },
                                    (result, error) => {
                                        if (error) {
                                            this.popupService.show({
                                                icon: 'error',
                                                title: 'Oops',
                                                text: 'Failed to add the singing key'
                                            });
                                            return;
                                        }

                                        this.setIdentity();
                                    }
                                );
                            }
                        });
                }
            });
    }

    onChangePassword() {
        this.popupService
            .show({
                title: 'Change Password',
                html: this.changePasswordEl.nativeElement,
                customClass: {
                    htmlContainer: 'swal2-popup-form'
                },
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Change',
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        let values = {
                            currentPassword: (
                                document.getElementById(
                                    'change-password-input1'
                                ) as HTMLInputElement
                            ).value,
                            newPassword: (
                                document.getElementById(
                                    'change-password-input2'
                                ) as HTMLInputElement
                            ).value,
                            newPasswordConfirm: (
                                document.getElementById(
                                    'change-password-input3'
                                ) as HTMLInputElement
                            ).value
                        };

                        if (!values?.currentPassword) {
                            Swal.showValidationMessage('Current password is required');
                        } else if (!values?.newPassword) {
                            Swal.showValidationMessage('New password is required');
                        } else if (!values?.newPasswordConfirm) {
                            Swal.showValidationMessage('Confirm new password is required');
                        } else if (values.newPassword != values?.newPasswordConfirm) {
                            Swal.showValidationMessage("New passwords doesn't match");
                        } else {
                            return this.messageService.sendMessage(
                                {
                                    task: TASKS.LOGIN,
                                    password: values.currentPassword
                                },
                                (result, error) => {
                                    if (!result || error) {
                                        Swal.showValidationMessage('Invalid current password');
                                        return resolve(false);
                                    }

                                    return this.messageService.sendMessage(
                                        {
                                            task: TASKS.CHANGE_PASSWORD,
                                            currentPassword: values.currentPassword,
                                            password: values.newPassword
                                        },
                                        (result, error) => {
                                            if (!result || error) {
                                                Swal.showValidationMessage(
                                                    'Failed to change password'
                                                );
                                                return resolve(false);
                                            }

                                            return resolve(undefined);
                                        }
                                    );
                                }
                            );
                        }

                        return resolve(false);
                    });
                }
            })
            .then((result) => {
                /* reset form values */
                (document.getElementById('change-password-input1') as HTMLInputElement).value = '';
                (document.getElementById('change-password-input2') as HTMLInputElement).value = '';
                (document.getElementById('change-password-input3') as HTMLInputElement).value = '';

                if (result.isConfirmed) {
                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'New password has changed successfully'
                    });
                }
            });
    }

    onAddNewKey() {
        this.popupService
            .show({
                title: 'Add New Key',
                html: this.addNewKeyEl.nativeElement,
                customClass: {
                    htmlContainer: 'swal2-popup-form'
                },
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: 'Add Key',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        let values = {
                            memonic: (
                                document.getElementById('add-key-memonic') as HTMLInputElement
                            ).checked,
                            private_key: (
                                document.getElementById('add-key-private') as HTMLInputElement
                            ).checked,
                            key: (document.getElementById('add-key-value') as HTMLInputElement)
                                .value
                        };

                        if (!values?.key) {
                            Swal.showValidationMessage('Key string is required');
                            return resolve(false);
                        }

                        return this.messageService.sendMessage(
                            {
                                task: TASKS.ADD_KEY,
                                type: values?.memonic ? 'memonic' : 'private-key',
                                keyString: values.key
                            },
                            (result, error) => {
                                if (!result || error) {
                                    Swal.showValidationMessage(
                                        error || 'Failed to add new singing key'
                                    );
                                    return resolve(false);
                                }

                                return resolve(undefined);
                            }
                        );
                    });
                }
            })
            .then((result) => {
                /* reset form values */
                (document.getElementById('add-key-memonic') as HTMLInputElement).checked = false;
                (document.getElementById('add-key-private') as HTMLInputElement).checked = true;
                (document.getElementById('add-key-value') as HTMLInputElement).value = '';

                if (result.isConfirmed) {
                    this.setIdentity();

                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'New singing key has been added successfully'
                    });
                }
            });
    }
}

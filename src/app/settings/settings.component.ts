import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
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
                html:
                    '<input id="swal-input1" type="password" class="swal2-popup-input">' +
                    '<input id="swal-input2" type="password" class="swal2-popup-input">' +
                    '<input id="swal-input3" type="password" class="swal2-popup-input">',
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
                                document.getElementById('swal-input1') as HTMLInputElement
                            ).value,
                            newPassword: (
                                document.getElementById('swal-input2') as HTMLInputElement
                            ).value,
                            newPasswordConfirm: (
                                document.getElementById('swal-input3') as HTMLInputElement
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
                if (result.isConfirmed) {
                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'New password has changed successfully'
                    });
                }
            });
    }
}

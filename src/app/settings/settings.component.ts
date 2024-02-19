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
    @Output() onLogout = new EventEmitter<boolean>();
    @Output() onGuides = new EventEmitter<boolean>();

    @ViewChild('changePasswordEl', { static: false }) changePasswordEl: ElementRef;
    @ViewChild('addNewKeyEl', { static: false }) addNewKeyEl: ElementRef;
    @ViewChild('resolveKeyEl', { static: false }) resolveKeyEl: ElementRef;
    @ViewChild('changeDIDKeyEl', { static: false }) changeDIDKeyEl: ElementRef;
    @ViewChild('showKeyEl', { static: false }) showKeyEl: ElementRef;

    currentDID: string = '';
    currentKeys: SigningKeys[] = [];
    selectedKeysData: SigningKeys;
    resolveKeyData: ResolveKeyData = { key: '', type: '' };
    profileImage: string = 'assets/avatar.png';
    name: string = 'Unknown';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.loadIdentity();
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
                                    return resolve(false);
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

                                        this.loadIdentity();

                                        return resolve(undefined);
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

    /* on create did */
    onCreateDID() {
        this.popupService
            .show({
                icon: 'warning',
                title: 'Create DID Key',
                text: 'This will remove current DID and all the related keys. Are you sure?',
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        this.messageService.sendMessage(
                            {
                                task: TASKS.CREATE_DID
                            },
                            (result, error) => {
                                console.log(result, error);
                                if (error) {
                                    Swal.showValidationMessage(error || 'Failed to create DID key');
                                    return resolve(false);
                                }

                                this.loadIdentity();

                                return resolve(undefined);
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
                        text: 'New DID Key added successfully'
                    });
                }
            });
    }

    /* on change did */
    onChangeDID() {
        this.popupService
            .show({
                title: 'Change DID Key',
                html: this.changeDIDKeyEl.nativeElement,
                confirmButtonText: 'Change',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading(),
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        let did = (document.getElementById('new-did-value') as HTMLInputElement)
                            .value;

                        if (!did) {
                            Swal.showValidationMessage('DID key string is required');
                            return resolve(false);
                        }

                        this.messageService.sendMessage(
                            {
                                task: TASKS.CHANGE_DID,
                                did: did
                            },
                            (result, error) => {
                                if (error) {
                                    Swal.showValidationMessage('Failed to change DID key');
                                    return resolve(false);
                                }

                                this.loadIdentity();

                                return resolve(undefined);
                            }
                        );
                    });
                }
            })
            .then((result) => {
                (document.getElementById('new-did-value') as HTMLInputElement).value = '';

                if (result.isConfirmed) {
                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'New DID Key added successfully'
                    });
                }
            });
    }

    /* set identity */
    private loadIdentity() {
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

    /* on singing key select */
    onSelectKey(data?: { mnemonic?: string; key: string; kid: string }) {
        this.selectedKeysData = data;
        this.changeDetector.detectChanges();

        this.popupService
            .show({
                title: 'Signing Key',
                html: this.showKeyEl.nativeElement,
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

                                        this.loadIdentity();
                                    }
                                );
                            }
                        });
                }
            });
    }

    /* on change password */
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

    /* on add new signing key */
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
                confirmButtonText: 'Resolve',
                showLoaderOnConfirm: true,
                preConfirm: () => {
                    return new Promise((resolve, reject) => {
                        let values = {
                            mnemonic: (
                                document.getElementById('add-key-mnemonic') as HTMLInputElement
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

                        this.resolveKeyData = {
                            key: values.key,
                            type: values?.mnemonic ? 'mnemonic' : 'private-key'
                        };

                        /* select the did popup */
                        this.popupService
                            .show({
                                title: 'Select DID',
                                html: this.resolveKeyEl.nativeElement,
                                showConfirmButton: true,
                                showCancelButton: true,
                                confirmButtonText: 'Done',
                                cancelButtonText: 'Cancel',
                                preConfirm: () => {
                                    return new Promise((resolve) => {
                                        let didPath = (
                                            document.getElementById(
                                                'resolve-did-didPath'
                                            ) as HTMLInputElement
                                        ).value;
                                        let didAddress = (
                                            document.getElementById(
                                                'resolve-did-didAddress'
                                            ) as HTMLInputElement
                                        ).value;

                                        if (!didPath) {
                                            Swal.showValidationMessage(
                                                'Resolved DID path is required'
                                            );
                                            return resolve(false);
                                        }
                                        if (!didAddress) {
                                            Swal.showValidationMessage('Resolved DID is required');
                                            return resolve(false);
                                        }

                                        this.messageService.sendMessage(
                                            {
                                                task: TASKS.ADD_KEY,
                                                type: values?.mnemonic ? 'mnemonic' : 'private-key',
                                                keyString: values.key,
                                                didPath: didPath, // selected DID address path
                                                didAddress: didAddress // selected DID address
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
                                (
                                    document.getElementById(
                                        'resolve-did-didPathType'
                                    ) as HTMLInputElement
                                ).value = 'custom';
                                (
                                    document.getElementById(
                                        'resolve-did-didPath'
                                    ) as HTMLInputElement
                                ).value = '';
                                (
                                    document.getElementById(
                                        'resolve-did-didAddress'
                                    ) as HTMLInputElement
                                ).value = '';

                                if (result.isConfirmed) {
                                    this.loadIdentity();

                                    this.popupService.show({
                                        icon: 'success',
                                        title: 'Success',
                                        text: 'New singing key has been added successfully'
                                    });
                                }

                                return resolve(false);
                            });
                    });
                }
            })
            .then((result) => {
                /* reset form values */
                (document.getElementById('add-key-mnemonic') as HTMLInputElement).checked = false;
                (document.getElementById('add-key-private') as HTMLInputElement).checked = true;
                (document.getElementById('add-key-value') as HTMLInputElement).value = '';

                if (result.isConfirmed) {
                    this.loadIdentity();

                    this.popupService.show({
                        icon: 'success',
                        title: 'Success',
                        text: 'New singing key has been added successfully'
                    });
                }
            });
    }

    logout() {
        this.messageService.sendMessage(
            {
                task: TASKS.LOGOUT
            },
            (result) => {
                if (result) {
                    this.onLogout.emit(true);
                }
            }
        );
    }

    onSelectGuides() {
        this.onGuides.emit(true);
    }
}

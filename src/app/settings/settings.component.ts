import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
    @Output() onProfile = new EventEmitter<boolean>();

    currentDID: string = '';
    currentKeys: string[] = [];
    profileImage: string = 'assets/avatar.png';
    name: string = 'Unknown';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    ngOnInit(): void {
        this.setIdentity();
    }

    onSelectProfile() {
        this.onProfile.emit(true);
    }

    /* test keys setup */
    onTestKeys() {
        Swal.fire({
            title: 'Initialize Test Data',
            text: 'Initialize Identity with test data. Warning! This will remove current DID and all the related keys. Are you sure?',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            showCancelButton: true,
            showLoaderOnConfirm: true,
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                this.messageService.sendMessage(
                    {
                        task: TASKS.CHANGE_DID,
                        did: 'did:key:z6MkswmCzzSLJEq5AM2EU9zDaoi7fLq7nLQVTX3qWj77ymJe'
                    },
                    (result, error) => {
                        if (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops',
                                text: 'Failed to change the DID key'
                            });
                            return;
                        }

                        this.messageService.sendMessage(
                            {
                                task: TASKS.ADD_KEY,
                                keyString:
                                    '861dc015d9edb888e6d9981b7e9c0dd86748efbe539e4a065ffb59f8cdbb096c'
                            },
                            (result, error) => {
                                if (error) {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops',
                                        text: 'Failed to add the singing key'
                                    });
                                    return;
                                }

                                this.setIdentity();

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: 'Test DID and Signing Key added successfully'
                                });
                            }
                        );
                    }
                );
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
                    console.log(result);
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
}

import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';
import Swal from 'sweetalert2';
import { PopupService } from '../services/popup.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    @Output() onBack = new EventEmitter<boolean>();

    profileImage: string = 'assets/avatar.png';
    profileForm: FormGroup;

    @ViewChild('message') message: ElementRef;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    onGoBack() {
        this.onBack.emit(true);
    }

    ngOnInit(): void {
        this.profileForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.email, Validators.required]),
            nickname: new FormControl('')
        });

        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (result) => {
                if (result) {
                    let profile = result?.profile;

                    this.profileForm.setValue({
                        name: profile?.name || '',
                        email: profile?.email || '',
                        nickname: profile?.nickname || ''
                    });

                    if (profile?.image) this.profileImage = profile?.image;
                    this.changeDetector.detectChanges();
                }
            }
        );
    }

    update() {
        let name = this.profileForm.get('name').value;
        let email = this.profileForm.get('email').value;
        let nickname = this.profileForm.get('nickname').value;

        if (!name) {
            this.message.nativeElement.textContent = 'Name is required';
            setTimeout(() => {
                if (this.message) this.message.nativeElement.textContent = '';
            }, 3000);
            return;
        }
        if (!email) {
            this.message.nativeElement.textContent = 'Email is required';
            setTimeout(() => {
                if (this.message) this.message.nativeElement.textContent = '';
            }, 3000);
            return;
        }

        this.messageService.sendMessage(
            {
                task: TASKS.UPDATE_IDENTITY,
                data: {
                    name,
                    email,
                    nickname
                }
            },
            (result, error) => {
                if (error) {
                    this.popupService.show({
                        icon: 'error',
                        title: 'Oops',
                        text: error?.message || 'Profile details update failed'
                    });
                    return;
                }

                this.popupService.show({
                    icon: 'success',
                    title: 'Updated',
                    text: 'Profile details updated'
                });
            }
        );
    }

    onImage(event) {
        const file: File = event.target.files[0];

        var reader: any = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.onerror = function (error) {
            console.log(error);
        };
        reader.readAsDataURL(file);
    }

    _handleReaderLoaded(e) {
        let reader = e.target;

        this.messageService.sendMessage(
            {
                task: TASKS.UPDATE_IDENTITY,
                data: {
                    image: reader.result
                }
            },
            (result, error) => {
                if (result) {
                    this.changeDetector.detectChanges();
                }
            }
        );

        this.profileImage = reader.result;
    }
}

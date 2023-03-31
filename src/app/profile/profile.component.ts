import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    EventEmitter,
    Output
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackgroundMessageService } from '../background-message.service';
import { TASKS } from 'src/const';
import { IdentityService } from '../identity.service';
import { ChangeProfileInfoModalComponent } from '../modals/modals.module';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    currentProfile: any = {};

    profileData = [
        { title: 'Name', key: 'name' },
        { title: 'Email', key: 'email' },
        { title: 'Nickname', key: 'nickname' },
        { title: 'Picture', key: 'picture' }
    ];

    @ViewChild('newKeyButton') newKeyButton: ElementRef;

    @ViewChild('changeProfileInfoModal') changeProfileInfoModal: ChangeProfileInfoModalComponent;

    @Output() clickedBack = new EventEmitter<boolean>();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private toastrService: ToastrService,
        private messageService: BackgroundMessageService,
        private identityService: IdentityService
    ) {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (response) => {
                if (response.did) {
                    this.currentProfile = {
                        ...this.currentProfile,
                        name: response.name,
                        email: response.email
                    };

                    let profile = this.identityService.getCurrentProfile() || {};
                    this.identityService.setCurrentProfile({
                        ...profile,
                        name: this.currentProfile?.name,
                        email: this.currentProfile?.email
                    });
                } else {
                    this.newKeyButton.nativeElement.disabled = true;
                }
                this.changeDetector.detectChanges();
            }
        );
    }

    ngOnInit(): void {}

    profileInfoChanged(changed: boolean) {
        if (changed) {
            this.currentProfile = this.identityService.getCurrentProfile() || {};
            this.changeDetector.detectChanges();
        }
    }

    openChangeProfileInfoModal(type: string) {
        this.changeProfileInfoModal.open(type);
    }

    goBack() {
        this.clickedBack.emit(true);
    }
}

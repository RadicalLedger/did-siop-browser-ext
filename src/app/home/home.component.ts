import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { TASKS } from 'src/utils/tasks';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @Output() onGuides = new EventEmitter<boolean>();

    currentDID: string;
    profileImage: string = 'assets/avatar.png';

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService
    ) {}

    onSelectGuides() {
        this.onGuides.emit(true);
    }

    ngOnInit(): void {
        this.messageService.sendMessage(
            {
                task: TASKS.GET_IDENTITY
            },
            (result) => {
                if (result) {
                    let profile = result?.profile;

                    if (profile?.image) this.profileImage = profile.image;

                    if (result.did) this.currentDID = result.did;

                    this.changeDetector.detectChanges();
                }
            }
        );
    }
}

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BackgroundMessageService } from '../services/message.service';
import { PopupService } from '../services/popup.service';
import utils from 'src/utils';

interface DataProps {
    index: string | number;
    title: string;
    vp: any;
}

@Component({
    selector: 'app-presentation',
    templateUrl: './presentation.component.html',
    styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit {
    @Input() data: DataProps;
    @Output() onBack = new EventEmitter<boolean>();

    activeTab: number = 0;
    credentials: any[] = [];
    currentVC: any = {};

    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageService: BackgroundMessageService,
        private popupService: PopupService
    ) {}

    ngOnInit(): void {
        this.credentials = this.data.vp.verifiableCredential;
    }

    onGoBack() {
        this.onBack.emit(true);
    }

    getValue(obj: any, key: string) {
        return utils.getObjectValue(obj, key);
    }

    getType(type: string) {
        switch (type) {
            case 'EducationalAchievementBadge':
                return 'Badge';
            case 'EducationalAchievementTranscript':
                return 'Transcript';
            case 'EducationalAchievementCertificate':
                return 'Certificate';
            default:
                return 'Other';
        }
    }

    onCredential(vc: any, i: number) {
        this.activeTab = i;
        this.currentVC = vc;

        this.changeDetector.detectChanges();
    }
}

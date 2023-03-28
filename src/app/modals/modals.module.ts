import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDIDModalComponent } from './change-did-modal/change-did-modal.component';
import { TestDataModalComponent } from './test-data-modal/test-data-modal.component';
import { CreateDIDModalComponent } from './create-did-modal/create-did-modal.component';
import { NewKeyModalComponent } from './new-key-modal/new-key-modal.component';
import { RemoveKeyModalComponent } from './remove-key-modal/remove-key-modal.component';
import { ChangePasswordModalComponent } from './change-password-modal/change-password-modal.component';
import { ChangeProfileInfoModalComponent } from './change-profile-info-modal/change-profile-info-modal.component';

@NgModule({
    declarations: [
        ChangeDIDModalComponent,
        TestDataModalComponent,
        CreateDIDModalComponent,
        NewKeyModalComponent,
        RemoveKeyModalComponent,
        ChangePasswordModalComponent,
        ChangeProfileInfoModalComponent
    ],
    imports: [CommonModule],
    exports: [
        ChangeDIDModalComponent,
        TestDataModalComponent,
        CreateDIDModalComponent,
        NewKeyModalComponent,
        RemoveKeyModalComponent,
        ChangePasswordModalComponent,
        ChangeProfileInfoModalComponent
    ]
})
export class ModalsModule {}

export {
    ChangeDIDModalComponent,
    TestDataModalComponent,
    CreateDIDModalComponent,
    NewKeyModalComponent,
    RemoveKeyModalComponent,
    ChangePasswordModalComponent,
    ChangeProfileInfoModalComponent
};

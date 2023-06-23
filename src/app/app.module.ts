import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { PresentationsComponent } from './presentations/presentations.component';
import { HomeComponent } from './home/home.component';
import { SettingsComponent } from './settings/settings.component';
import { GuidesComponent } from './guides/guides.component';
import { ProfileComponent } from './profile/profile.component';
import { AddKeyComponent } from './models/add-key/add-key.component';
import { ChangePasswordComponent } from './models/change-password/change-password.component';
import { ChangeDidComponent } from './models/change-did/change-did.component';
import { ConfirmRequestComponent } from './models/confirm-request/confirm-request.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MainComponent,
        CredentialsComponent,
        PresentationsComponent,
        HomeComponent,
        SettingsComponent,
        GuidesComponent,
        ProfileComponent,
        AddKeyComponent,
        ChangePasswordComponent,
        ChangeDidComponent,
        ConfirmRequestComponent
    ],
    imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, MatIconModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}

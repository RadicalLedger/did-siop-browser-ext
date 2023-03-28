import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class IdentityService {
    currentDID: string;
    currentName: string;
    currentEmail: string;
    signingInfoSet: any[] = [];

    constructor() {}

    setCurrentDID(did: string) {
        this.currentDID = did;
    }

    getCurrentDID(): string {
        return this.currentDID;
    }

    setSigningInfoSet(signingInfoSet: any[]) {
        this.signingInfoSet = signingInfoSet;
    }

    getSigningInfoSet(): any[] {
        return this.signingInfoSet;
    }

    setCurrentName(name: string) {
        this.currentName = name;
    }

    getCurrentName(): string {
        return this.currentName;
    }

    setCurrentEmail(email: string) {
        this.currentEmail = email;
    }

    getCurrentEmail(): string {
        return this.currentEmail;
    }
}

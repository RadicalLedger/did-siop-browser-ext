import { Injectable } from '@angular/core';
/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

@Injectable({
    providedIn: 'root'
})
export class BackgroundMessageService {
    private runtime: any;

    constructor() {
        try {
            this.runtime = browser;
        } catch (err) {
            try {
                this.runtime = chrome;
            } catch (err) {
                console.log('DID-SIOP ERROR: No runtime detected');
            }
        }
    }

    sendMessage(message, callback) {
        this.runtime.runtime.sendMessage(message, callback);
    }

    tabQuery(query, callback) {
        this.runtime.tabs.query(query, callback);
    }
}

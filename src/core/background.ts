/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import { NOTIFICATIONS } from 'src/const';

let engine: any;
let action: any;
let runtime: any;
let tabs: any;

let signingInfoSet: any[] = [];
let loggedInState: string = undefined;

try {
    engine = browser;
    action = browser.browserAction;
    runtime = browser.runtime;
    tabs = browser.tabs;
} catch (err) {
    try {
        engine = chrome;
        // @ts-ignore
        action = chrome.action;
        runtime = chrome.runtime;
        tabs = chrome.tabs;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

runtime.onMessage.addListener(function (request, sender, sendResponse) {
    tabs.query({ active: true, currentWindow: true }, function (_tabs) {
        tabs.sendMessage(
            _tabs[0].id,
            { request, sender, signingInfo: signingInfoSet, loggedIn: loggedInState },
            function (response) {
                if (response !== undefined) {
                    signingInfoSet = response.signingInfoSet || [];
                    loggedInState = response.loggedInState || false;
                }

                if (response?.notification) {
                    /* clear new request notification */
                    engine.notifications.clear(NOTIFICATIONS.NEW_REQUEST);

                    engine.notifications.create(
                        response?.notification.id,
                        response?.notification.options,
                        (id: string) => {
                            setTimeout(() => {
                                engine.notifications.clear(id);
                            }, 5000);
                        }
                    );
                }

                if (response?.badge) {
                    action.setBadgeBackgroundColor({ color: '#24b6aa' });
                    action.setBadgeText({ text: `${response.badge.text || 0}` });
                }

                sendResponse(response?.data);
            }
        );

        return true;
    });

    return true;
});

/* keep the background alive */
/* only on chrome runtime */
chrome.alarms.create({ periodInMinutes: 4.9 });
chrome.alarms.onAlarm.addListener(() => {
    // console.log('log for debug');
});

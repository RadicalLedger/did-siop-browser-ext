/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import functions from './functions';
import tasks from './functions/tasks';
import { Response } from './interfaces';

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
        action = chrome.action;
        runtime = chrome.runtime;
        tabs = chrome.tabs;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

const setVariables = (result) => {
    if (result.loggedInState) loggedInState = result.loggedInState;
    if (result.signingInfoSet) signingInfoSet = result.signingInfoSet;
};

runtime.onMessage.addListener(function (request, sender, response) {
    tabs.query({ active: true, currentWindow: true }, function (_tabs) {
        if (!sender.tab) {
            functions[request.task](
                { request, data: { loggedInState, signingInfoSet } },
                (result: Response) => {
                    if (result?.set) setVariables(result.set);

                    return response(result.result);
                }
            );
        } else {
            tasks[request.task](
                { request, data: { loggedInState, signingInfoSet } },
                (result: Response) => {
                    if (result?.set) setVariables(result.set);

                    return response(result.result);
                }
            );
        }

        /* tabs.sendMessage(
            _tabs[0].id,
            { request, sender, signingInfo: signingInfoSet, loggedIn: loggedInState },
            function (response) {
                if (response !== undefined) {
                    signingInfoSet = response.signingInfoSet || [];
                    loggedInState = response.loggedInState || false;
                }

                if (response?.notification) {
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
        ); */

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

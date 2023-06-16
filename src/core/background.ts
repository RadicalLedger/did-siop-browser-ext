import { Provider } from 'did-siop';

import { Response } from './interfaces';

import functions from './functions';
import tasks from './functions/tasks';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

const DATA = {
    signingInfoSet: [],
    loggedInState: undefined,
    provider: Provider
};

var engine: any;
var action: any;
var runtime: any;
var tabs: any;

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

const setVariables = (result = {}) => {
    for (const key in result) {
        DATA[key] = result[key];
    }
};

runtime.onMessage.addListener(function (request, sender, response) {
    const onResponse = (res: Response) => {
        if (res?.set) setVariables(res.set);

        return response(res.result, res.error);
    };

    if (!sender.tab) {
        functions[request.task]({ request, data: DATA }, onResponse);
    } else {
        tasks[request.task]({ request, data: DATA }, onResponse);
    }
    /* tabs.query({ active: true, currentWindow: true }, function (_tabs) {
        tabs.sendMessage(_tabs[0].id, { request, sender }, response);
    }); */

    /* tabs.query({ active: true, currentWindow: true }, function (_tabs) {
         tabs.sendMessage(
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
        );

        return true;
    }); */

    return true;
});

/* keep the background alive */
/* only on chrome runtime */
chrome.alarms.create({ periodInMinutes: 4.9 });
chrome.alarms.onAlarm.addListener(() => {
    // console.log('log for debug');
});

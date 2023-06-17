import { Response } from '../types/core';

import functions from './functions';
import tasks from './functions/tasks';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

var DATA = {
    signingInfoSet: [],
    loggedInState: undefined,
    provider: undefined
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

    return true;
});

/* keep the background alive */
/* only on chrome runtime */
chrome.alarms.create({ periodInMinutes: 4.9 });
chrome.alarms.onAlarm.addListener(() => {
    // console.log('log for debug');
});

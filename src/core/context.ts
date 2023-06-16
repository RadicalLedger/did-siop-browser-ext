/* import { Provider } from 'did-siop';

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

let engine: any;
let action: any;
let runtime: any;
let tabs: any;

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

runtime.onMessage.addListener(function ({ request, sender }, _sender, response) {
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
 */

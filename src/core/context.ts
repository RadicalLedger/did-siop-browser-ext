/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import { CONTEXT_TASKS } from 'src/utils/context';

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

runtime.onMessage.addListener(function ({ request, data }, _sender, response) {
    switch (request.task) {
        case CONTEXT_TASKS.NEW_CONTENT:
            localStorage.setItem('new-content', 'true');
            response({ result: true });
            break;

        default:
            response({ result: true });
            break;
    }

    return true;
});

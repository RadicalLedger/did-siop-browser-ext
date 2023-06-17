/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

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
    return true;
});

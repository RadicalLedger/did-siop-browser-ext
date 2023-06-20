var engine: any;
var action: any;
var runtime: any;
var storage: any;
var tabs: any;

try {
    engine = browser;
    action = browser.browserAction;
    runtime = browser.runtime;
    tabs = browser.tabs;
    storage = browser.storage.local;
} catch (err) {
    try {
        engine = chrome;
        action = chrome.action;
        runtime = chrome.runtime;
        tabs = chrome.tabs;
        storage = chrome.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

export { engine, action, runtime, tabs, storage };

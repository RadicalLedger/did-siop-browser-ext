var engine: any;
var action: any;
var runtime: any;
var storage: any;
var tabs: any;

try {
    engine = chrome;
} catch (err) {
    try {
        engine = browser;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

try {
    action = chrome.action;
} catch (err) {
    try {
        action = browser.browserAction;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

try {
    runtime = chrome.runtime;
} catch (err) {
    try {
        runtime = browser.runtime;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

try {
    tabs = chrome.tabs;
} catch (err) {
    try {
        tabs = browser.tabs;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

try {
    storage = chrome.storage.local;
} catch (err) {
    try {
        storage = browser.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: ', err);
    }
}

export { engine, action, runtime, tabs, storage };

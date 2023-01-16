/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

let runtime: any;
let tabs: any;

let signingInfoSet: any[] = [];
let loggedInState: string = undefined;

try {
    runtime = browser.runtime;
    tabs = browser.tabs;
} catch (err) {
    try {
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
            { request, signingInfo: signingInfoSet, loggedIn: loggedInState },
            function (response) {
                signingInfoSet = response.signingInfoSet;
                loggedInState = response.loggedInState;

                sendResponse(response?.data);
            }
        );

        return true;
    });

    return true;
});

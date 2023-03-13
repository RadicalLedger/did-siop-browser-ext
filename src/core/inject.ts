import { TASKS } from '../const';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

let runtime: any;

try {
    runtime = browser.runtime;
} catch (err) {
    try {
        runtime = chrome.runtime;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

const didSIOPLogins = document.querySelectorAll('[data-did-siop]');
for (let i = 0; i < didSIOPLogins.length; i++) {
    didSIOPLogins[i].addEventListener('click', function () {
        let did_siop = this.getAttribute('data-did-siop');
        runtime.sendMessage(
            {
                task: TASKS.MAKE_REQUEST,
                did_siop: did_siop
            },
            (response) => {
                if (response.result) {
                    console.log('Request sent to DID-SIOP');
                } else if (response.err) {
                    throw new Error('DID_SIOP_ERROR: ' + response.err);
                }
            }
        );
    });
}

function didSiopVcBtn() {
    const didSiopVC = document.querySelectorAll('[data-did-siop-vc]');
    for (let i = 0; i < didSiopVC.length; i++) {
        const element = <HTMLButtonElement>didSiopVC[i];

        element.dataset.active = 'true';
        element.addEventListener('click', function () {
            let vc = this.getAttribute('data-did-siop-vc');
            runtime.sendMessage(
                {
                    task: TASKS.ADD_VC,
                    vc: vc
                },
                (response) => {
                    if (response.result) {
                        console.log('Request sent to DID-SIOP');
                    } else if (response.err) {
                        throw new Error('DID_SIOP_VC_ERROR: ' + response.err);
                    }
                }
            );
        });
    }
}

function didSiopSettingsBtn() {
    const didSIOPSettings = document.querySelectorAll('[data-did-siop-settings]');

    for (let i = 0; i < didSIOPSettings.length; i++) {
        didSIOPSettings[i].addEventListener('click', function () {
            let did_siop = this.getAttribute('data-did-siop-settings');
            runtime.sendMessage(
                {
                    task: TASKS.SET_SETTINGS,
                    did_siop: did_siop
                },
                (response) => {
                    if (response.result) {
                        console.log('Settings setup on DID-SIOP');
                    } else if (response.err) {
                        throw new Error('DID_SIOP_ERROR: ' + response.err);
                    }
                }
            );
        });
    }
}

setInterval(() => {
    if (localStorage.getItem('new-content')) {
        didSiopSettingsBtn();
        didSiopVcBtn();

        localStorage.removeItem('new-content');
    }
}, 100);

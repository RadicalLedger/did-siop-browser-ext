import { STORAGE_KEYS, TASKS } from '../const';
import { decrypt } from './CryptoUtils';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

let runtime: any;
let storage: any;

try {
    runtime = browser.runtime;
    storage = browser.storage.local;
} catch (err) {
    try {
        runtime = chrome.runtime;
        storage = chrome.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

const getStorage = async (key: string) => {
    return new Promise((resolve) => {
        storage.get([key], async (result) => {
            resolve(result[key]);
        });
    });
};

const sendMessage = async (key: any) => {
    return new Promise((resolve) => {
        runtime.sendMessage(
            {
                task: key
            },
            (response) => {
                resolve(response.result);
            }
        );
    });
};

async function didSiopLoginBtn() {
    const didSIOPLogins = document.querySelectorAll('[data-did-siop]');
    let loggedInState: any = await sendMessage(TASKS.GET_LOGIN_STATE);
    let did: any = await getStorage(STORAGE_KEYS.userDID);
    let signingInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);
    let encodedUserData: any = '';

    if (loggedInState) {
        did = decrypt(did, loggedInState);
        signingInfo = JSON.parse(decrypt(signingInfo, loggedInState));

        if (signingInfo?.length > 0) signingInfo = signingInfo[0]?.key;

        encodedUserData = Buffer.from(JSON.stringify({ did, key: signingInfo })).toString('base64');
    }

    for (let i = 0; i < didSIOPLogins.length; i++) {
        const element = <HTMLButtonElement>didSIOPLogins[i];

        element.dataset.user = encodedUserData;

        element.dataset.active = 'true';
        element.addEventListener('click', function () {
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
        const element = <HTMLButtonElement>didSIOPSettings[i];

        element.dataset.active = 'true';
        element.addEventListener('click', function () {
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

/* for initial run */
localStorage.setItem('new-content', 'true');

setInterval(() => {
    if (localStorage.getItem('new-content')) {
        didSiopLoginBtn();
        didSiopSettingsBtn();
        didSiopVcBtn();

        localStorage.removeItem('new-content');
    }
}, 100);

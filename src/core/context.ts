/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import axios from 'axios';
import { Provider, ERROR_RESPONSES, VPData, Resolvers } from 'did-siop';
import * as queryString from 'query-string';
import { STORAGE_KEYS, TASKS } from '../const';
import { authenticate, checkExtAuthenticationState, initExtAuthentication } from './AuthUtils';
import { encrypt, decrypt } from './CryptoUtils';
import { CustomDidResolver } from './custom-did-resolver';
import { DidCreators } from './DidUtils';

let provider: Provider;
let signingInfoSet: any[] = [];
let loggedInState: string = undefined;

let runtime: any;
let tabs: any;
let storage: any;

try {
    runtime = browser.runtime;
    tabs = browser.tabs;
    storage = browser.storage.local;
} catch (err) {
    try {
        runtime = chrome.runtime;
        tabs = chrome.tabs;
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

async function checkSigning() {
    try {
        if (!provider) {
            let did: any = await getStorage(STORAGE_KEYS.userDID);
            did = decrypt(did, loggedInState);

            const resolver = new Resolvers.CombinedDidResolver('eth');
            const customResolver = new CustomDidResolver();
            resolver.removeAllResolvers();
            resolver.addResolver(customResolver);

            provider = await Provider.getProvider(did, undefined, [resolver]);
        }

        if (!signingInfoSet || signingInfoSet.length < 1) {
            let result: any = await getStorage(STORAGE_KEYS.signingInfoSet);
            signingInfoSet = JSON.parse(decrypt(result, loggedInState));

            if (!signingInfoSet) {
                signingInfoSet = [];
            }
        }

        signingInfoSet.forEach((info) => {
            provider.addSigningParams(info.key);
        });
    } catch (err) {
        console.log({ err });
        provider = undefined;
        signingInfoSet = [];
        throw err;
    }
}

runtime.onMessage.addListener(function ({ request, sender, signingInfo, loggedIn }, _sender, res) {
    if (signingInfo) signingInfoSet = signingInfo || [];
    if (loggedIn) loggedInState = loggedIn;
    // console.log({ request });

    const sendResponse = (data: any) => {
        // console.log(signingInfoSet);
        res({
            signingInfoSet,
            loggedInState,
            data
        });
    };

    if (!sender.tab) {
        switch (request.task) {
            case TASKS.CHANGE_DID: {
                changeDID(request.did)
                    .then((result) => {
                        sendResponse({ result: result });
                    })
                    .catch((err) => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.CHANGE_PROFILE_INFO: {
                changeProfileInfo(request?.data?.type, request?.data?.value)
                    .then((result) => {
                        sendResponse({ result: result });
                    })
                    .catch((err) => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.ADD_KEY: {
                addKey(request.keyInfo)
                    .then((result) => {
                        sendResponse({ result: result });
                    })
                    .catch((err) => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.REMOVE_KEY: {
                removeKey(request.kid)
                    .then((result) => {
                        sendResponse({ result: result });
                    })
                    .catch((err) => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.CHECK_LOGIN_STATE: {
                sendResponse({ result: checkLoggedInState() });
                break;
            }
            case TASKS.LOGIN: {
                login(request.password, (result: boolean) => {
                    sendResponse({ result });
                });
                break;
            }
            case TASKS.LOGOUT: {
                sendResponse({ result: logout() });
                break;
            }
            case TASKS.CHECK_EXT_AUTHENTICATION: {
                checkExtAuthenticationState((result: boolean) => {
                    sendResponse({ result });
                });
                break;
            }
            case TASKS.INIT_EXT_AUTHENTICATION: {
                sendResponse({ result: initExtAuthentication(request.password) });
                break;
            }
            case TASKS.CHANGE_EXT_AUTHENTICATION: {
                changePassword(request.oldPassword, request.newPassword, (result: boolean) => {
                    sendResponse({ result });
                });
                break;
            }
            case TASKS.GET_IDENTITY: {
                getIdentity((data: any) => {
                    sendResponse(data);
                });
                break;
            }
            case TASKS.GET_REQUESTS: {
                getRequests((didSiopRequests) => {
                    sendResponse({ didSiopRequests });
                });
                break;
            }
            case TASKS.GET_VCS: {
                getVCs((data) => {
                    sendResponse({ vcs: data });
                });
                break;
            }
            case TASKS.GET_VPS: {
                getVPs((data) => {
                    sendResponse({ vps: data });
                });
                break;
            }
            case TASKS.REMOVE_VC: {
                removeVC(request.index, (data) => {
                    sendResponse({ vcs: data });
                });
                break;
            }
            case TASKS.REMOVE_VP: {
                removeVP(request.index, (data) => {
                    sendResponse({ vps: data });
                });
                break;
            }
            case TASKS.ADD_VP: {
                try {
                    let result = addVP(request.name, request.vp);
                    sendResponse({ result });
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.PROCESS_REQUEST: {
                processRequest(
                    request.did_siop_index,
                    request.confirmation,
                    request.id_token,
                    request.vp_data
                )
                    .then((result) => {
                        sendResponse({ result });
                    })
                    .catch((err) => {
                        console.log('Error in processing request : ', err.message);
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.CREATE_DID: {
                createDID(request.method, request.data)
                    .then((result) => {
                        sendResponse({
                            result: {
                                did: result.did,
                                kid: result.kid,
                                keyString: result.privateKey
                            }
                        });
                    })
                    .catch((err) => {
                        sendResponse({ err: err.message });
                    });
            }
        }
    } else {
        switch (request.task) {
            case TASKS.MAKE_REQUEST: {
                try {
                    addRequest(request.did_siop, (result) => {
                        sendResponse({ result });
                    });
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.ADD_VC: {
                try {
                    let result = addVC(request.vc);
                    sendResponse({ result });
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.SET_SETTINGS: {
                try {
                    let result = setSettings(request.did_siop);
                    sendResponse({ result });
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.GET_LOGIN_STATE: {
                try {
                    let result = getLoggedInState();
                    sendResponse({ result });
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
        }
    }

    return true;
});

async function getIdentity(callback: any) {
    let profile: any = {};
    let did = '';
    let keys = '';

    profile = await getStorage(STORAGE_KEYS.profile);
    let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
    let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

    try {
        if (encryptedDID) did = decrypt(encryptedDID, loggedInState);
        if (encryptedSigningInfo) keys = decrypt(encryptedSigningInfo, loggedInState);
    } catch (err) {
        return callback({ profile: {}, did: '', keys: [] });
    }

    return callback({ profile, did, keys });
}

function checkLoggedInState(): boolean {
    if (loggedInState) {
        return true;
    }
    return false;
}

function getLoggedInState(): any {
    return loggedInState;
}

function login(password: string, callback: any) {
    authenticate(password, (state: boolean) => {
        localStorage.setItem('new-content', 'true');

        if (state) {
            loggedInState = password;
            return callback(true);
        }

        storage.set({ [STORAGE_KEYS.loginState]: undefined });
        callback(false);
    });
}

function logout(): boolean {
    localStorage.setItem('new-content', 'true');

    if (loggedInState) {
        loggedInState = undefined;
        return true;
    }
    return false;
}

function changePassword(oldPassword: string, newPassword: string, callback: any) {
    login(oldPassword, async (state: any) => {
        if (state) {
            let changed = initExtAuthentication(newPassword);
            if (changed) {
                let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
                let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

                if (encryptedDID) {
                    let didRecrypted = encrypt(decrypt(encryptedDID, oldPassword), newPassword);
                    storage.set({ [STORAGE_KEYS.userDID]: didRecrypted });
                }
                if (encryptedSigningInfo) {
                    let keysRecrypted = encrypt(
                        decrypt(encryptedSigningInfo, oldPassword),
                        newPassword
                    );
                    storage.set({ [STORAGE_KEYS.signingInfoSet]: keysRecrypted });
                }

                loggedInState = newPassword;

                localStorage.setItem('new-content', 'true');
                return callback(true);
            } else {
                return callback(false);
            }
        }

        callback(false);
    });
}

async function changeDID(did: string): Promise<string> {
    try {
        const resolver = new Resolvers.CombinedDidResolver('eth');
        const customResolver = new CustomDidResolver();
        resolver.removeAllResolvers();
        resolver.addResolver(customResolver);

        provider = await Provider.getProvider(did, undefined, [resolver]);

        let encryptedDID = encrypt(did, loggedInState);
        storage.set({ [STORAGE_KEYS.userDID]: encryptedDID });

        signingInfoSet = [];
        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

        localStorage.setItem('new-content', 'true');
        return 'Identity changed successfully';
    } catch (err) {
        console.log({ err });
        return Promise.reject(err);
    }
}

async function changeProfileInfo(type: string, value: string): Promise<string> {
    try {
        let profile: any = (await getStorage(STORAGE_KEYS.profile)) || {};

        profile[type] = value;
        storage.set({ [STORAGE_KEYS.profile]: profile });

        return `Profile ${type} changed successfully`;
    } catch (err) {
        console.log({ err });
        return Promise.reject(err);
    }
}

async function addKey(key: string): Promise<string> {
    try {
        await checkSigning();
        let kid = provider.addSigningParams(key);

        signingInfoSet.push({
            key: key,
            kid: kid
        });

        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

        localStorage.setItem('new-content', 'true');
        return kid;
    } catch (err) {
        console.log({ err });
        return Promise.reject(err);
    }
}

async function removeKey(kid: string): Promise<string> {
    try {
        await checkSigning();
        provider.removeSigningParams(kid);
        signingInfoSet = signingInfoSet.filter((key) => {
            return key.kid !== kid;
        });

        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

        localStorage.setItem('new-content', 'true');
        return 'Key removed successfully';
    } catch (err) {
        return Promise.reject(err);
    }
}

async function processRequest(
    request_index: number,
    confirmation: any,
    id_token: any,
    vp_data: any
) {
    let processError: Error;
    let request_result: any = await getRequestByIndex(request_index);
    let request = request_result?.request;

    if (queryString.parseUrl(request).url === 'openid://') {
        try {
            await checkSigning();
            try {
                if (confirmation) {
                    try {
                        // console.log({ request });
                        // console.log({ parsed: queryString.parseUrl(request) });
                        let decodedRequest = await provider.validateRequest(request);

                        try {
                            //let response = await provider.generateResponse(decodedRequest.payload);
                            // console.log({ id_token });
                            if (id_token) decodedRequest.payload.claims['id_token'] = id_token;

                            let response = {};
                            if (vp_data?.vp_token && vp_data?._vp_token) {
                                let vps: VPData = {
                                    vp_token: vp_data.vp_token,
                                    _vp_token: vp_data._vp_token
                                };

                                response = await provider.generateResponseWithVPData(
                                    decodedRequest.payload,
                                    5000,
                                    vps
                                );
                            } else {
                                response = await provider.generateResponse(
                                    decodedRequest.payload,
                                    5000
                                );
                            }

                            if (
                                decodedRequest.payload.response_mode &&
                                decodedRequest.payload.response_mode === 'post'
                            ) {
                                try {
                                    await postToRP(decodedRequest.payload.redirect_uri, response);
                                } catch (e) {
                                    console.log('Failed to post request the response failed', e);
                                }
                            } else if (
                                decodedRequest.payload.response_mode &&
                                decodedRequest.payload.response_mode === 'get'
                            ) {
                                try {
                                    await getToRP(decodedRequest.payload.redirect_uri, response);
                                } catch (e) {
                                    console.log('Failed to get request the response', e);
                                }
                            } else {
                                let uri = decodedRequest.payload.redirect_uri;

                                if (uri) {
                                    let url = new URL(uri);
                                    url.search = new URLSearchParams({
                                        code: response as string
                                    }).toString();

                                    if (tabs?.create) {
                                        tabs.create({
                                            url: url
                                        });
                                    } else if (window.open) {
                                        window.open(url, '_self');
                                    }
                                }
                            }

                            console.log(
                                'Successfully logged into ' + decodedRequest.payload.redirect_uri
                            );
                            /* console.log(
                                'Sent response to ' +
                                    decodedRequest.payload.redirect_uri +
                                    ' with token: ',
                                response
                            ); */

                            removeRequest(request_index, () => {});
                            return (
                                'Successfully logged into ' + decodedRequest.payload.redirect_uri
                            );
                        } catch (err) {
                            console.log({ error1: err });
                            processError = err;
                        }
                    } catch (err) {
                        console.log({ error2: err });

                        let uri: any = queryString.parseUrl(request).query.redirect_uri;

                        if (uri) {
                            let url = new URL(uri);
                            url.search = new URLSearchParams({
                                error: provider.generateErrorResponse(err.message) as string
                            }).toString();

                            if (tabs?.create) {
                                tabs.create({
                                    url: url
                                });
                            } else if (window.open) {
                                window.open(url, '_self');
                            }

                            removeRequest(request_index, () => {});
                        } else {
                            processError = new Error('invalid redirect url');
                        }
                    }
                } else {
                    let uri: any = queryString.parseUrl(request).query.redirect_uri;

                    if (uri) {
                        let url = new URL(uri);
                        url.search = new URLSearchParams({
                            error: provider.generateErrorResponse(
                                ERROR_RESPONSES.access_denied.err.message
                            ) as string
                        }).toString();

                        if (tabs?.create) {
                            tabs.create({
                                url: url
                            });
                        } else if (window.open) {
                            window.open(url, '_self');
                        }

                        removeRequest(request_index, () => {});

                        return 'Successfully declined logging request';
                    } else {
                        processError = new Error('invalid redirect url');
                    }
                }
            } catch (err) {
                console.log({ error3: err });
                processError = err;
            }
        } catch (err) {
            processError = new Error(
                'Error retrieving credentials. Please check Identity and Signing keys'
            );
        }
    }
    if (processError) throw processError;
}

async function postToRP(redirectUri: string, response: any) {
    const rawResponse = await fetch(redirectUri, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: response })
    });

    try {
        const content = await rawResponse.json();
        console.log(content);
    } catch (e) {
        console.log(e);
    }
}

async function getToRP(redirectUri: string, response: any) {
    let url = new URL(redirectUri);
    url.search = new URLSearchParams({ code: response }).toString();

    const rawResponse = await fetch(url);

    try {
        const content = await rawResponse.json();
        // console.log(content);
    } catch (e) {
        console.log(e);
    }
}

function getRequests(callback: any) {
    storage.get([STORAGE_KEYS.requests], (result) => {
        let storedRequests = result[STORAGE_KEYS.requests] || [];

        callback(storedRequests);
    });
}

async function getRequestByIndex(index: number) {
    return new Promise((resolve) => {
        storage.get([STORAGE_KEYS.requests], (result) => {
            let storedRequests = result[STORAGE_KEYS.requests] || [];

            resolve(
                storedRequests.filter((sr) => {
                    return sr.index == index;
                })[0]
            );
        });
    });
}

function addRequest(request: string, callback: any) {
    try {
        if (queryString.parseUrl(request).url != 'openid://') throw new Error('Invalid request');

        storage.get([STORAGE_KEYS.requests], (result) => {
            let storedRequests: any = result[STORAGE_KEYS.requests] || [];

            let index = 0;
            for (let i = 0; i < storedRequests.length; i++) {
                if (storedRequests[i].index > index) index = storedRequests[i].index;
            }
            ++index;

            let client_id = queryString.parseUrl(request).query.client_id;
            storedRequests.push({ index, client_id, request });

            storage.set({ [STORAGE_KEYS.requests]: storedRequests });

            callback(true);
        });
    } catch (err) {
        callback(false);
        throw err;
    }
}

function removeRequest(index: number, callback: any) {
    storage.get([STORAGE_KEYS.requests], (result) => {
        let storedRequests: any = result[STORAGE_KEYS.requests] || [];

        let request = storedRequests.filter((sr) => {
            return sr.index == index;
        })[0];

        storedRequests = storedRequests.filter((sr) => {
            return sr.index != index;
        });

        storage.set({ [STORAGE_KEYS.requests]: storedRequests });

        callback(request.request);
    });
}

/* clear local storage */
// storage.clear();

/* view local storage */
/* storage.get(function (result) {
    console.log({ storage: result });
}); */

/* Verifiable credentials */
function addVC(vc: any): boolean {
    try {
        if (!vc) throw new Error('Invalid visual credential');

        return storage.get([STORAGE_KEYS.vcs], function (result) {
            let store = result[STORAGE_KEYS.vcs] || [];

            let index = 1;
            if (store.length > 0) index = Math.max(...store.map((o) => o.index)) + 1;

            store.push({ index, vc: JSON.parse(atob(vc)) });
            storage.set({ [STORAGE_KEYS.vcs]: store });

            return true;
        });
    } catch (err) {
        throw err;
    }
}

function getVCs(callback: any) {
    storage.get([STORAGE_KEYS.vcs], function (result) {
        let store = result[STORAGE_KEYS.vcs] || [];

        callback(store);
    });
}

function removeVC(index: number, callback: any) {
    storage.get([STORAGE_KEYS.vcs], function (result) {
        let store = result[STORAGE_KEYS.vcs] || [];

        store = store.filter((sr) => {
            return sr.index != index;
        });

        storage.set({ [STORAGE_KEYS.vcs]: store });

        callback(store);
    });
}

/* Verifiable presentations */
function addVP(name: string, vp: any): boolean {
    try {
        if (!name) throw new Error('Visual presentation name is required');
        if (!vp) throw new Error('Invalid visual presentation');

        return storage.get([STORAGE_KEYS.vps], function (result) {
            let store = result[STORAGE_KEYS.vps] || [];

            let index = 1;
            if (store.length > 0) index = Math.max(...store.map((o) => o.index)) + 1;

            store.push({ index, name, vp: JSON.parse(atob(vp)) });
            storage.set({ [STORAGE_KEYS.vps]: store });

            return true;
        });
    } catch (err) {
        throw err;
    }
}

function getVPs(callback: any) {
    storage.get([STORAGE_KEYS.vps], function (result) {
        let store = result[STORAGE_KEYS.vps] || [];

        callback(store);
    });
}

function removeVP(index: number, callback) {
    storage.get([STORAGE_KEYS.vps], function (result) {
        let store = result[STORAGE_KEYS.vps] || [];

        store = store.filter((sr) => {
            return sr.index != index;
        });

        storage.set({ [STORAGE_KEYS.vps]: store });

        callback(store);
    });
}

function setSettings(base64: string) {
    try {
        let settings = parseJwt(base64);
        //console.log({ settings });

        /* set key */
        if (Array.isArray(settings?.did_resolver)) {
            storage.set({ [STORAGE_KEYS.crypto_suit]: settings?.did_resolver[0]?.cryptoSuite });
        }

        /* set signing key */
        if (settings?.signing_params?.did) changeDID(settings.signing_params.did);

        if (settings?.signing_params?.private_key) addKey(settings.signing_params.private_key);

        return true;
    } catch (error) {
        throw error;
    }
}

function parseJwt(token: string) {
    return JSON.parse(Buffer.from(token, 'base64').toString());
}

async function createDID(method: string, data: any): Promise<any> {
    try {
        const create = DidCreators[method];
        let identity = await create(data);
        await changeDID(identity.did);
        let kid = await addKey(identity.privateKey);
        return {
            did: identity.did,
            kid,
            privateKey: identity.privateKey
        };
    } catch (err) {
        return Promise.reject(err);
    }
}

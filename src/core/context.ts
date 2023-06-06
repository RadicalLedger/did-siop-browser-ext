/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import axios from 'axios';
import { Provider, ERROR_RESPONSES, VPData, Resolvers } from 'did-siop';
import * as queryString from 'query-string';
import { NOTIFICATIONS, STORAGE_KEYS, TASKS } from '../const';
import { authenticate, checkExtAuthenticationState, initExtAuthentication } from './AuthUtils';
import { encrypt, decrypt } from './CryptoUtils';
import { CustomDidResolver } from './custom-did-resolver';
import { DidCreators } from './DidUtils';
import createStandardVP from '../utils/createVp';
import { resolve } from 'dns';
import Wallet, { Types, generateMnemonic } from 'did-hd-wallet';

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

    const sendResponse = (data: any, notification?: any, badge?: any) => {
        res({
            signingInfoSet,
            loggedInState,
            data,
            notification,
            badge
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
                addKey(request.keyInfo, request.type)
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
                getRequests((data) => {
                    sendResponse({ didSiopRequests: data?.data }, null, data.badge);
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
            case TASKS.CREATE_VP: {
                try {
                    createVP(
                        {
                            did: request.did,
                            name: request.name,
                            vcs: request.vcs
                        },
                        (result: boolean) => {
                            sendResponse({ result });
                        }
                    );
                } catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.ADD_VP: {
                try {
                    addVP(request.name, request.vp, (result: boolean) => {
                        sendResponse({ result });
                    });
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
                        sendResponse({ result: result.message }, result.notification, result.badge);
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
    } else {
        switch (request.task) {
            case TASKS.MAKE_REQUEST: {
                try {
                    addRequest(request.did_siop).then((result: any) => {
                        sendResponse({ result: result?.data }, result.notification, result.badge);
                    });
                } catch (err) {
                    console.log(err);
                    sendResponse({ err: err.message });
                }
                break;
            }
            case TASKS.ADD_VC: {
                try {
                    addVC(request.vc, (result: boolean) => {
                        sendResponse({ result });
                    });
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

async function addKey(key: string, type: string = 'private-key'): Promise<string> {
    try {
        if (type === 'memonic') {
            const wallet = new Wallet(Types.MNEMONIC, key);
            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let currentDID = decrypt(encryptedDID, loggedInState);

            const { privateKey: issuerPrivateKey, did: issuerDID }: any = await wallet.getChildKeys(
                process.env.REACT_APP_HOLDER_DERIVATION_PATH || 'm/256/256/1'
            );
            const { privateKey: holderPrivateKey, did: holderDID }: any = await wallet.getChildKeys(
                process.env.REACT_APP_HOLDER_DERIVATION_PATH || 'm/256/256/2'
            );

            if (holderDID === currentDID) {
                key = holderPrivateKey;
            } else if (issuerDID === currentDID) {
                key = issuerPrivateKey;
            } else {
                key = holderPrivateKey;
            }
        }

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
                let decodedRequest = await provider.validateRequest(request);

                if (confirmation) {
                    try {
                        // console.log({ request });
                        // console.log({ parsed: queryString.parseUrl(request) });

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
                                    await postToRP(decodedRequest.payload.redirect_uri, {
                                        token: response
                                    });
                                } catch (e) {
                                    console.log('Failed to post request the response failed', e);
                                }
                            } else if (
                                decodedRequest.payload.response_mode &&
                                decodedRequest.payload.response_mode === 'get'
                            ) {
                                try {
                                    await getToRP(decodedRequest.payload.redirect_uri, {
                                        code: response
                                    });
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
                                    } else if (window.open && url) {
                                        window.open(url, '_self');
                                    }
                                }
                            }

                            const result: any = await removeRequest(request_index);
                            return {
                                ...result,
                                message:
                                    'Successfully logged into ' +
                                    decodedRequest.payload.redirect_uri
                            };
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
                            } else if (window.open && url) {
                                window.open(url, '_self');
                            }

                            const result: any = await removeRequest(request_index);
                            return {
                                ...result,
                                message: 'Failed to log into ' + decodedRequest.payload.redirect_uri
                            };
                        } else {
                            processError = new Error('invalid redirect url');
                        }
                    }
                } else {
                    let uri: any = queryString.parseUrl(request).query.redirect_uri;

                    if (uri) {
                        if (
                            decodedRequest.payload.response_mode &&
                            decodedRequest.payload.response_mode === 'post'
                        ) {
                            try {
                                await postToRP(decodedRequest.payload.redirect_uri, {
                                    error: provider.generateErrorResponse(
                                        ERROR_RESPONSES.access_denied.err.message
                                    ) as string
                                });

                                const result: any = await removeRequest(request_index);
                                return {
                                    ...result,
                                    message: 'Successfully declined logging request'
                                };
                            } catch (e) {
                                console.log('Failed to post request the response failed', e);
                            }
                        } else if (
                            decodedRequest.payload.response_mode &&
                            decodedRequest.payload.response_mode === 'get'
                        ) {
                            try {
                                await getToRP(decodedRequest.payload.redirect_uri, {
                                    error: provider.generateErrorResponse(
                                        ERROR_RESPONSES.access_denied.err.message
                                    ) as string
                                });

                                const result: any = await removeRequest(request_index);
                                return {
                                    ...result,
                                    message: 'Successfully declined logging request'
                                };
                            } catch (e) {
                                console.log('Failed to get request the response', e);
                            }
                        } else {
                            try {
                                let uri = decodedRequest.payload.redirect_uri;

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
                                    } else if (window.open && url) {
                                        window.open(url, '_self');
                                    }
                                }

                                return 'Successfully declined logging request';
                            } catch (error) {
                                console.log(error);
                            } finally {
                                await removeRequest(request_index);
                            }
                        }
                    } else {
                        await removeRequest(request_index);
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
        body: JSON.stringify(response)
    });

    try {
        await rawResponse.json();
    } catch (e) {
        console.log(e);
    }

    return;
}

async function getToRP(redirectUri: string, response: any) {
    let url = new URL(redirectUri);
    url.search = new URLSearchParams(response).toString();

    const rawResponse = await fetch(url);

    try {
        await rawResponse.json();
    } catch (e) {
        console.log(e);
    }

    return;
}

function getRequests(callback: any) {
    storage.get([STORAGE_KEYS.requests], (result) => {
        let storedRequests = result[STORAGE_KEYS.requests] || [];

        callback({
            data: storedRequests,
            badge: {
                text: storedRequests.length
            }
        });
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

async function addRequest(request: string) {
    return new Promise((resolve, reject) => {
        try {
            if (queryString.parseUrl(request).url != 'openid://')
                throw new Error('Invalid request');

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

                resolve({
                    data: true,
                    badge: {
                        text: storedRequests.length
                    },
                    notification: {
                        id: NOTIFICATIONS.NEW_REQUEST,
                        options: {
                            title: 'New Request Available',
                            message: 'New request has been added to the extension',
                            iconUrl: 'assets/did_siop_favicon.png',
                            type: 'basic'
                        }
                    }
                });
            });
        } catch (err) {
            reject({ data: false });
            throw err;
        }
    });
}

async function removeRequest(index: number) {
    return new Promise((resolve, reject) => {
        storage.get([STORAGE_KEYS.requests], (result) => {
            let storedRequests: any = result[STORAGE_KEYS.requests] || [];

            let request = storedRequests.filter((sr) => {
                return sr.index == index;
            })[0];

            storedRequests = storedRequests.filter((sr) => {
                return sr.index != index;
            });

            storage.set({ [STORAGE_KEYS.requests]: storedRequests });

            resolve({
                data: request.request,
                badge: {
                    text: storedRequests.length
                }
            });
        });
    });
}

/* clear local storage */
// storage.clear();

/* view local storage */
/* storage.get(function (result) {
    console.log({ storage: result });
}); */

/* Verifiable credentials */
function addVC(vc: any, callback: any): boolean {
    try {
        if (!vc) throw new Error('Invalid visual credential');

        return storage.get([STORAGE_KEYS.vcs], function (result) {
            let store = result[STORAGE_KEYS.vcs] || [];

            let index = 1;
            if (store.length > 0) index = Math.max(...store.map((o) => o.index)) + 1;

            store.push({ index, vc: JSON.parse(atob(vc)) });
            storage.set({ [STORAGE_KEYS.vcs]: store });

            if (callback) callback(true);
        });
    } catch (err) {
        if (callback) callback(false);
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

interface CreateVPProps {
    name: string;
    did: string;

    vcs: any[];
}

/* Create verifiable presentations */
async function createVP({ name, did, vcs }: CreateVPProps, callback: any) {
    await checkSigning();
    let private_key = '';

    if (loggedInState) {
        if (signingInfoSet?.length > 0) private_key = signingInfoSet[0]?.key;
    }

    try {
        if (!name) throw new Error('Visual presentation name is required');
        if (vcs?.length === 0) throw new Error('Atleast one visual credential is required');

        const vp: any = await createStandardVP({ did, private_key, vcs });

        if (!vp) return callback(false);

        return addVP(name, btoa(JSON.stringify(vp)), callback);
    } catch (err) {
        console.log(err);
        if (callback) callback(false);
        throw err;
    }
}

/* Verifiable presentations */
function addVP(name: string, vp: any, callback: any): boolean {
    try {
        if (!name) throw new Error('Visual presentation name is required');
        if (!vp) throw new Error('Invalid visual presentation');

        return storage.get([STORAGE_KEYS.vps], function (result) {
            let store = result[STORAGE_KEYS.vps] || [];

            let index = 1;
            if (store.length > 0) index = Math.max(...store.map((o) => o.index)) + 1;

            store.push({ index, name, vp: JSON.parse(atob(vp)) });
            storage.set({ [STORAGE_KEYS.vps]: store });

            if (callback) callback(true);
        });
    } catch (err) {
        if (callback) callback(false);
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

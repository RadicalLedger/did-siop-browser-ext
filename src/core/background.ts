/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

import { Provider, ERROR_RESPONSES, VPData } from 'did-siop';
import * as queryString from 'query-string';
import { stringify } from 'querystring';
import { STORAGE_KEYS, TASKS } from '../const';
import { authenticate, checkExtAuthenticationState, initExtAuthentication } from './AuthUtils';
import { encrypt, decrypt } from './CryptoUtils';
import { DidCreators } from './DidUtils';

let provider: Provider;
let signingInfoSet: any[] = [];
let loggedInState: string = undefined;

let runtime: any;
let tabs: any;

try {
    runtime = browser.runtime;
    tabs = browser.tabs;
}
catch (err) {
    try {
        runtime = chrome.runtime;
        tabs = chrome.tabs;
    }
    catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

async function checkSigning() {
    try {
        if (!provider) {

            let did = decrypt(localStorage.getItem(STORAGE_KEYS.userDID), loggedInState);
            provider = await Provider.getProvider(did);
        }

        if (signingInfoSet.length < 1) {
            signingInfoSet = JSON.parse(decrypt(localStorage.getItem(STORAGE_KEYS.signingInfoSet), loggedInState));
            if (!signingInfoSet) {
                signingInfoSet = [];
            }
            else {
                signingInfoSet.forEach(info => {
                    provider.addSigningParams(info.key);
                })
            }
        }
    }
    catch (err) {
        provider = undefined;
        signingInfoSet = [];
        throw err;
    }
}

runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!sender.tab) {
        switch (request.task) {
            case TASKS.CHANGE_DID: {
                changeDID(request.did)
                    .then(result => {
                        sendResponse({ result: result });
                    })
                    .catch(err => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.ADD_KEY: {
                addKey(request.keyInfo)
                    .then(result => {
                        sendResponse({ result: result });
                    })
                    .catch(err => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.REMOVE_KEY: {
                removeKey(request.kid)
                    .then(result => {
                        sendResponse({ result: result });
                    })
                    .catch(err => {
                        sendResponse({ err: err.message });
                    });
                break;
            }
            case TASKS.CHECK_LOGIN_STATE: {
                sendResponse({ result: checkLoggedInState() });
                break;
            }
            case TASKS.LOGIN: {
                sendResponse({ result: login(request.password) });
                break;
            }
            case TASKS.LOGOUT: {
                sendResponse({ result: logout() });
                break;
            }
            case TASKS.CHECK_EXT_AUTHENTICATION: {
                let result = checkExtAuthenticationState();
                sendResponse({ result: result });
                break;
            }
            case TASKS.INIT_EXT_AUTHENTICATION: {
                sendResponse({ result: initExtAuthentication(request.password) });
                break;
            }
            case TASKS.CHANGE_EXT_AUTHENTICATION: {
                sendResponse({ result: changePassword(request.oldPassword, request.newPassword) });
                break;
            }
            case TASKS.GET_IDENTITY: {
                let did = '';
                let keys = '';

                try {
                    let encryptedDID = localStorage.getItem(STORAGE_KEYS.userDID);
                    let encryptedSigningInfo = localStorage.getItem(STORAGE_KEYS.signingInfoSet);
                    if (encryptedDID) {
                        did = decrypt(encryptedDID, loggedInState);
                        keys = decrypt(encryptedSigningInfo, loggedInState);
                    }
                }
                catch (err) { }

                sendResponse({ did, keys });
                break;
            }
            case TASKS.GET_REQUESTS: {
                sendResponse({ didSiopRequests: getRequests() });
                break;
            }
            case TASKS.PROCESS_REQUEST: {
                processRequest(request.did_siop_index, request.confirmation, request.vp_token)
                    .then(result => {
                        sendResponse({ result: result });
                    })
                    .catch(err => {
                        console.log("Error in processing request : ", err.message);
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
                    .catch(err => {
                        sendResponse({ err: err.message });
                    })
            }
        }
    }
    else {
        switch (request.task) {
            case TASKS.MAKE_REQUEST: {
                try {
                    let result = addRequest(request.did_siop);
                    sendResponse({ result });
                }
                catch (err) {
                    sendResponse({ err: err.message });
                }
                break;
            }
        }
    }
    return true;
});


function checkLoggedInState(): boolean {
    if (loggedInState) {
        return true;
    }
    return false;
}

function login(password: string): boolean {
    if (authenticate(password)) {
        loggedInState = password;
        return true;
    }
    return false;
}

function logout(): boolean {
    if (loggedInState) {
        loggedInState = undefined;
        return true;
    }
    return false;
}

function changePassword(oldPassword: string, newPassword: string): boolean {
    if (login(oldPassword)) {
        let changed = initExtAuthentication(newPassword);
        if (changed) {
            let encryptedDID = localStorage.getItem(STORAGE_KEYS.userDID);
            let encryptedSigningInfo = localStorage.getItem(STORAGE_KEYS.signingInfoSet);
            if (encryptedDID) {
                let didRecrypted = encrypt(decrypt(encryptedDID, oldPassword), newPassword);
                localStorage.setItem(STORAGE_KEYS.userDID, didRecrypted);
            }
            if (encryptedSigningInfo) {
                let keysRecrypted = encrypt(decrypt(encryptedSigningInfo, oldPassword), newPassword);
                localStorage.setItem(STORAGE_KEYS.signingInfoSet, keysRecrypted);
            }
            loggedInState = newPassword;
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}


async function changeDID(did: string): Promise<string> {
    try {
        let newProvider = await Provider.getProvider(did);
        provider = newProvider;
        let encryptedDID = encrypt(did, loggedInState);
        localStorage.setItem(STORAGE_KEYS.userDID, encryptedDID);
        signingInfoSet = [];
        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        localStorage.setItem(STORAGE_KEYS.signingInfoSet, encryptedSigningInfo);
        return 'Identity changed successfully';
    }
    catch (err) {
        return Promise.reject(err);
    }
}

async function addKey(key: string): Promise<string> {
    try {
        await checkSigning();
        let kid = provider.addSigningParams(key);
        signingInfoSet.push({
            key: key,
            kid: kid,
        });
        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        localStorage.setItem(STORAGE_KEYS.signingInfoSet, encryptedSigningInfo);
        return kid;
    }
    catch (err) {
        return Promise.reject(err);
    }
}

async function removeKey(kid: string): Promise<string> {
    try {
        await checkSigning();
        provider.removeSigningParams(kid);
        signingInfoSet = signingInfoSet.filter(key => {
            return key.kid !== kid;
        })
        let encryptedSigningInfo = encrypt(JSON.stringify(signingInfoSet), loggedInState);
        localStorage.setItem(STORAGE_KEYS.signingInfoSet, encryptedSigningInfo);
        return 'Key removed successfully';
    }
    catch (err) {
        return Promise.reject(err);
    }
}

async function processRequest(request_index: number, confirmation: any, vp_token: any) {
    let processError: Error;
    let request = getRequestByIndex(request_index).request;

    if (queryString.parseUrl(request).url === 'openid://') {
        try {
            await checkSigning();
            try {
                if (confirmation) {
                    if (vp_token) {
                        let new_request = await generateRequestWithVP(queryString.parseUrl(request).query.redirect_uri, vp_token)
                        if (new_request) request = new_request
                    }
                    //console.log(JSON.parse(Buffer.from(request.split('.')[1], 'base64').toString()))

                    let vps: VPData = {
                        vp_token: vp_token,
                        _vp_token: {}
                    }

                    try {
                        let decodedRequest = await provider.validateRequest(request);
                        // let response = vp_token ? await provider.generateResponseWithVPData(decodedRequest.payload, 5000, vps) : await provider.generateResponse(decodedRequest.payload);

                        try {
                            let response = await provider.generateResponse(decodedRequest.payload);
                            console.log("decodedRequest.payload", decodedRequest.payload);
                            if (decodedRequest.payload.response_mode && decodedRequest.payload.response_mode === 'post') {
                                try {
                                    await postToRP(decodedRequest.payload.redirect_uri, response)
                                }
                                catch (e) {
                                    console.log("PostToRP failed", e)
                                }
                            }
                            else {
                                let uri = decodedRequest.payload.redirect_uri + '#' + response;
                                tabs.create({
                                    url: uri,
                                });
                            }
                            console.log('Sent response to ' + decodedRequest.payload.redirect_uri + ' with id_token: ' + response);
                            removeRequest(request_index);
                            return 'Successfully logged into ' + decodedRequest.payload.redirect_uri;
                        }
                        catch (err) {
                            processError = err;
                        }
                    }
                    catch (err) {
                        let uri = queryString.parseUrl(request).query.client_id;
                        if (uri) {
                            uri = uri + '#' + provider.generateErrorResponse(err.message);
                            tabs.create({
                                url: uri,
                            });
                            removeRequest(request_index);
                        } else {
                            processError = new Error('invalid redirect url');
                        }
                    }
                }
                else {
                    let uri = queryString.parseUrl(request).query.client_id;
                    if (uri) {
                        uri = uri + '#' + provider.generateErrorResponse(ERROR_RESPONSES.access_denied.err.message);
                        tabs.create({
                            url: uri,
                        });
                        removeRequest(request_index);
                    } else {
                        processError = new Error('invalid redirect url');
                    }
                }
            }
            catch (err) {
                processError = err;
            }
        }
        catch (err) {
            processError = new Error('Error retrieving credentials. Please check Identity and Signing keys');
        }
    }
    if (processError) throw processError;
}

const generateRequestWithVP = (redirect_url, vp_token) => {
    return new Promise<string>((resolve) => {
        let url = new URL(redirect_url);

        fetch(`${url.origin}/get_request_object_vp/vp`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vp_token })
        })
            .then(res => res.json())
            .then(data => {
                resolve(data.reqObj)
            })
            .catch(err => {
                resolve(null)
            })
    })
}

async function postToRP(redirectUri: string, response: any) {
    const rawResponse = await fetch(redirectUri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "token": response })
    });

    try {
        const content = await rawResponse.json();
        console.log(content);
    }
    catch (e) {
        console.log(e);
    }
}

function getRequests(): any[] {
    let storedRequests: any = localStorage.getItem(STORAGE_KEYS.requests);
    if (!storedRequests) storedRequests = '[]';
    return JSON.parse(storedRequests);
}

function getRequestByIndex(index: number): any {
    let storedRequests: any = localStorage.getItem(STORAGE_KEYS.requests);
    if (!storedRequests) storedRequests = '[]';
    storedRequests = JSON.parse(storedRequests);
    return storedRequests.filter(sr => { return sr.index == index })[0];
}

function addRequest(request: string): boolean {
    try {
        if (queryString.parseUrl(request).url != 'openid://') throw new Error('Invalid request');
        let storedRequests: any = localStorage.getItem(STORAGE_KEYS.requests);
        if (!storedRequests) storedRequests = '[]';
        storedRequests = JSON.parse(storedRequests);
        let index = 0;
        for (let i = 0; i < storedRequests.length; i++) {
            if (storedRequests[i].index > index) index = storedRequests[i].index;
        }
        ++index;
        let client_id = queryString.parseUrl(request).query.client_id;
        storedRequests.push({ index, client_id, request });
        localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(storedRequests));
        return true;
    }
    catch (err) {
        throw err;
    }
}

function removeRequest(index: number): string {
    let storedRequests: any = localStorage.getItem(STORAGE_KEYS.requests);
    if (!storedRequests) storedRequests = '[]';
    storedRequests = JSON.parse(storedRequests);
    let request = storedRequests.filter(sr => { return sr.index == index })[0];
    storedRequests = storedRequests.filter(sr => { return sr.index != index });
    localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(storedRequests));
    return request.request;
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
        }
    }
    catch (err) {
        return Promise.reject(err);
    }

}
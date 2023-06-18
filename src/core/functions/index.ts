import { TASKS } from 'src/utils/tasks';
import utils from 'src/utils';
import { checkSigning, getStorage, getProvider, sendContext } from 'src/core/helpers';
import { setDID, setSingingKey } from '../helpers/did';
import { STORAGE_KEYS } from 'src/utils/storage';
import { Request } from '../../types/core';
import configs from 'src/configs';
import jwt from 'jsonwebtoken';
import VCSD from 'sd-vc-lib';
import Wallet, { Types, generateMnemonic } from 'did-hd-wallet';
import { CONTEXT_TASKS } from 'src/utils/context';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

var engine: any;
var action: any;
var storage: any;
var tabs: any;

try {
    engine = browser;
    tabs = browser.tabs;
    action = browser.browserAction;
    storage = browser.storage.local;
} catch (err) {
    try {
        engine = chrome;
        tabs = chrome.tabs;
        action = chrome.action;
        storage = chrome.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

/* tasks */
export default {
    [TASKS.AUTHENTICATE]: ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.password], function (result) {
                let storedHash = result[STORAGE_KEYS.password];

                response({ result: storedHash != undefined });
            });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.CHECK_LOGIN]: ({ request, data }: Request, response) => {
        try {
            if (data?.loggedInState) return response({ result: true });

            return response({ result: false });
        } catch (error) {
            response({ result: false, error: error?.message });
        }
    },
    [TASKS.LOGIN]: ({ request, data }: Request, response) => {
        try {
            let password = request.password;

            storage.get([STORAGE_KEYS.salt], function (result) {
                let salt = result[STORAGE_KEYS.salt] || '';
                let hashed = utils.hash(password, salt);

                storage.get([STORAGE_KEYS.password], function (result) {
                    let storedHash = result[STORAGE_KEYS.password] || '';

                    if (hashed === storedHash) {
                        response({
                            result: true,
                            set: {
                                loggedInState: password
                            }
                        });
                    } else {
                        response({ result: false });
                        //storage.set({ [STORAGE_KEYS.loginState]: undefined });
                    }
                });
            });
        } catch (err) {
            response({ result: false });
            //storage.set({ [STORAGE_KEYS.loginState]: undefined });
        }
    },
    [TASKS.REGISTER]: ({ request, data }: Request, response) => {
        try {
            let password = request.password;
            let salt = utils.randomString(32);
            let hashed = utils.hash(password, salt);

            storage.set({ [STORAGE_KEYS.password]: hashed });
            storage.set({ [STORAGE_KEYS.salt]: salt });

            response({ result: true });
        } catch (err) {
            response({ result: false });
        }
    },
    [TASKS.GET_IDENTITY]: async ({ request, data }: Request, response) => {
        try {
            let did;
            let keys;

            let profile = await getStorage(STORAGE_KEYS.profile);
            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

            if (encryptedDID) did = utils.decrypt(encryptedDID, data.loggedInState);
            if (encryptedSigningInfo)
                keys = JSON.parse(utils.decrypt(encryptedSigningInfo, data.loggedInState));

            response({
                result: {
                    did,
                    keys,
                    profile
                },
                set: {
                    signingInfoSet: keys
                }
            });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.UPDATE_IDENTITY]: async ({ request, data }: Request, response) => {
        try {
            let profile: any = (await getStorage(STORAGE_KEYS.profile)) || {};

            for (const key in request.data) {
                profile[key] = request.data[key];
            }

            storage.set({ [STORAGE_KEYS.profile]: profile });

            response({ result: profile });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.CHANGE_DID]: async ({ request, data }: Request, response) => {
        try {
            data.provider = await getProvider(request.did);

            /* store did */
            await setDID({ request: { did: request.did }, data });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: { signingInfoSet: [], provider: data.provider } });
        } catch (error) {
            console.log({ error });
            response({ error: error?.message });
        }
    },
    [TASKS.CREATE_DID]: async ({ request, data }: Request, response) => {
        try {
            const resolver_url = configs.env.offchain;
            const mnemonic = generateMnemonic(128);

            const wallet = new Wallet(Types.MNEMONIC, mnemonic);
            const ed = new VCSD.utils.ed25519();

            const {
                publicKey: holderPublicKey,
                privateKey: holderPrivateKey,
                did: holderDID,
                verificationKey: holderVerificationKey
            }: any = await wallet.getChildKeys('m/256/256/2');

            let holderChallengeResponse: any = await fetch(`${resolver_url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ did: holderDID })
            });
            holderChallengeResponse = await holderChallengeResponse.json();

            const { challenge: holderChallenge } = jwt.decode(
                holderChallengeResponse.data.challengeToken
            ) as any;

            let holderResponse: any = await fetch(`${resolver_url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    did: holderDID,
                    verificationKey: holderVerificationKey,
                    challengeResponse: {
                        publicKey: holderPublicKey,
                        cipherText: ed
                            .sign(
                                Buffer.from(holderChallenge, 'hex'),
                                Buffer.from(holderPrivateKey as string, 'hex')
                            )
                            .toHex(),
                        jwt: holderChallengeResponse.data.challengeToken
                    }
                })
            });
            holderResponse = await holderResponse.json();

            if (holderResponse?.data?.status !== 'success') {
                return response({ error: 'Holder DID document creation failed' });
            }

            /* set did */
            await setDID({ request: { did: holderDID }, data });

            /* set new singing key */
            await setSingingKey({
                request: {
                    currentDID: holderDID,
                    keyString: holderPrivateKey,
                    type: 'private-key'
                },
                data
            });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: data });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.ADD_KEY]: async ({ request, data }: Request, response) => {
        try {
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );
            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let currentDID = utils.decrypt(encryptedDID, data.loggedInState);

            const kid = await setSingingKey({
                request: { currentDID, keyString: request.keyString, type: request.type },
                data
            });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: kid, set: data });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.REMOVE_KEY]: async ({ request, data }: Request, response) => {
        try {
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );

            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            /* remove kid from provider and singing keys */
            data.provider.removeSigningParams(request.kid);
            data.signingInfoSet = data.signingInfoSet.filter((key) => {
                return key.kid !== request.kid;
            });

            /* store the new key set */
            let encryptedSigningInfo = utils.encrypt(
                JSON.stringify(data.signingInfoSet),
                data.loggedInState
            );
            storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: data });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.CHANGE_PASSWORD]: async ({ request, data }: Request, response) => {
        try {
            let password = request.password;
            let salt = utils.randomString(32);
            let hashed = utils.hash(password, salt);

            /* update new password and store */
            storage.set({ [STORAGE_KEYS.password]: hashed });
            storage.set({ [STORAGE_KEYS.salt]: salt });

            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

            /* re encrypt did key and store */
            if (encryptedDID) {
                let didReEncrypted = utils.encrypt(
                    utils.decrypt(encryptedDID, request.currentPassword),
                    request.password
                );
                storage.set({ [STORAGE_KEYS.userDID]: didReEncrypted });
            }

            /* re encrypt singing keys and store */
            if (encryptedSigningInfo) {
                let keysReEncrypted = utils.encrypt(
                    utils.decrypt(encryptedSigningInfo, request.currentPassword),
                    request.password
                );
                storage.set({ [STORAGE_KEYS.signingInfoSet]: keysReEncrypted });
            }

            data.loggedInState = request.password;

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: { loggedInState: data.loggedInState } });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    }
};

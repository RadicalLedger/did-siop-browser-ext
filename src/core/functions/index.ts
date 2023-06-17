import { TASKS } from 'src/utils/tasks';
import utils from 'src/utils';
import { STORAGE_KEYS } from 'src/utils/storage';
import { Request } from '../../types/core';
import { CustomDidResolver } from 'src/utils/custom-resolver';
//import Wallet, { Types } from 'did-hd-wallet';
import { Provider, Resolvers } from 'did-siop';
let Wallet;
let Types;
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

/* helper functions */
const getStorage = async (key: string) => {
    return new Promise((resolve) => {
        storage.get([key], async (result) => {
            resolve(result[key]);
        });
    });
};

const checkSigning = (provider: any, loggedInState: string, signingInfoSet: SigningKeys[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!provider) {
                let did: any = await getStorage(STORAGE_KEYS.userDID);
                did = utils.decrypt(did, loggedInState);

                const resolver = new Resolvers.CombinedDidResolver('key');
                const customResolver = new CustomDidResolver();
                resolver.removeAllResolvers();
                resolver.addResolver(customResolver);

                provider = await Provider.getProvider(did, undefined, [resolver]);
            }

            if (!signingInfoSet || signingInfoSet.length < 1) {
                let result: any = await getStorage(STORAGE_KEYS.signingInfoSet);
                signingInfoSet = JSON.parse(utils.decrypt(result, loggedInState));

                if (!signingInfoSet) {
                    signingInfoSet = [];
                }
            }

            signingInfoSet.forEach((info) => {
                provider.addSigningParams(info.key);
            });

            resolve({ provider, loggedInState, signingInfoSet });
        } catch (error) {
            provider = undefined;
            signingInfoSet = [];
            reject(error);
        }
    });
};

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
            const resolver = new Resolvers.CombinedDidResolver('key');
            const customResolver = new CustomDidResolver();
            resolver.removeAllResolvers();
            resolver.addResolver(customResolver);

            data.provider = await Provider.getProvider(request.did, undefined, [resolver]);

            /* store did */
            let encryptedDID = utils.encrypt(request.did, data.loggedInState);
            storage.set({ [STORAGE_KEYS.userDID]: encryptedDID });

            /* reset singing info set */
            data.signingInfoSet = [];
            let encryptedSigningInfo = utils.encrypt(
                JSON.stringify(data.signingInfoSet),
                data.loggedInState
            );
            storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

            response({ result: true, set: { signingInfoSet: [], provider: data.provider } });
        } catch (error) {
            console.log({ error });
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

            if (request.type === 'memonic') {
                const wallet = new Wallet(Types.MNEMONIC, request.keyString);

                const { privateKey: issuerPrivateKey, did: issuerDID }: any =
                    await wallet.getChildKeys('m/256/256/1');
                const { privateKey: holderPrivateKey, did: holderDID }: any =
                    await wallet.getChildKeys('m/256/256/2');

                if (holderDID === currentDID) {
                    request.keyString = holderPrivateKey;
                } else if (issuerDID === currentDID) {
                    request.keyString = issuerPrivateKey;
                } else {
                    request.keyString = holderPrivateKey;
                }
            }

            let kid = data.provider.addSigningParams(request.keyString);

            data.signingInfoSet.push({
                key: request.keyString,
                kid: kid
            });

            let encryptedSigningInfo = utils.encrypt(
                JSON.stringify(data.signingInfoSet),
                data.loggedInState
            );
            storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

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

            response({ result: true, set: { loggedInState: data.loggedInState } });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    }
};

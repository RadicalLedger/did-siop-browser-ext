import utils from 'src/utils';
import { STORAGE_KEYS } from 'src/utils/storage';
import { CustomDidResolver } from 'src/utils/custom-resolver';
import { Provider, Resolvers } from 'did-siop';
import { Request } from 'src/types/core';

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
        console.log('helpers/index.ts - ', err);
    }
}

const getStorage = async (key: string) => {
    return new Promise((resolve) => {
        storage.get([key], async (result) => {
            resolve(result[key]);
        });
    });
};

const getProvider = async (did: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resolver = new Resolvers.CombinedDidResolver('key');
            const customResolver = new CustomDidResolver();
            resolver.removeAllResolvers();
            resolver.addResolver(customResolver);

            let provider = await Provider.getProvider(did, undefined, [resolver]);
            resolve(provider);
        } catch (error) {
            reject(error);
        }
    });
};

const checkSigning = (provider: any, loggedInState: string, signingInfoSet: SigningKeys[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!provider) {
                let did: any = await getStorage(STORAGE_KEYS.userDID);
                did = utils.decrypt(did, loggedInState);

                provider = await getProvider(did);
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

const sendContext = async ({ request = {}, data = {} }: Request, response?) => {
    tabs.query({ active: true, currentWindow: true }, function (_tabs) {
        tabs.sendMessage(_tabs[0].id, { request, data }, function (result) {
            response(result);
            return true;
        });
    });
};

export { getStorage, getProvider, checkSigning, sendContext };

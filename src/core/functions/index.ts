import { TASKS } from 'src/utils/tasks';
import utils from 'src/utils';
import { STORAGE_KEYS } from 'src/utils/storage';
import { Request, Response } from '../interfaces';

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser"/>

var engine: any;
var action: any;
var storage: any;

try {
    engine = browser;
    action = browser.browserAction;
    storage = browser.storage.local;
} catch (err) {
    try {
        engine = chrome;
        action = chrome.action;
        storage = chrome.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: No runtime detected');
    }
}

export default {
    [TASKS.AUTHENTICATE]: ({ request, data }: Request, response) => {
        storage.get([STORAGE_KEYS.password], function (result) {
            let storedHash = result[STORAGE_KEYS.password];

            response({ result: storedHash != undefined });
        });
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
                                loggedInState: true
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
    }
};

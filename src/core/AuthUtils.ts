import { STORAGE_KEYS } from '../const';
import { hash } from './CryptoUtils';

let storage: any;

try {
    storage = browser.storage.local;
} catch (err) {
    try {
        storage = chrome.storage.local;
    } catch (err) {
        console.log('DID-SIOP ERROR: No storage detected');
    }
}

export function initExtAuthentication(password: string): boolean {
    try {
        let salt = randomString(32);
        let hashed = hash(password, salt);

        storage.set({ [STORAGE_KEYS.password]: hashed });
        storage.set({ [STORAGE_KEYS.salt]: salt });
        return true;
    } catch (err) {
        return false;
    }
}

export function authenticate(password: string, callback: any) {
    storage.get([STORAGE_KEYS.salt], function (result) {
        let salt = result[STORAGE_KEYS.salt] || '';
        let hashed = hash(password, salt);

        storage.get([STORAGE_KEYS.password], function (result) {
            let storedHash = result[STORAGE_KEYS.password] || '';
            callback(hashed === storedHash);
        });
    });
}

export function checkExtAuthenticationState(callback: any) {
    storage.get([STORAGE_KEYS.password], function (result) {
        let storedHash = result[STORAGE_KEYS.password];

        callback(storedHash != undefined);
    });
}

function randomString(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

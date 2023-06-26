import * as hashUtils from 'hash.js';
import { createCipher, createDecipher } from 'browserify-aes';
import _ from 'lodash';

const getObjectValue = (obj: any, key: string) => {
    if (!obj) return null;

    for (const k in obj) {
        if (k === key) return obj[k];

        if (_.isObject(obj[k]) && !_.isArray(obj[k])) {
            let v = getObjectValue(obj[k], key);

            if (v) return v;
        }
    }

    return null;
};

export default {
    getObjectValue,
    randomString: (length: number = 7) => {
        return (Math.random() + 1).toString(36).substring(length);
    },
    hash: (value: string, salt: string) => {
        let sha256 = hashUtils.sha256();
        let level1 = sha256.update(value).digest('hex');
        let salted = level1 + salt;
        let level2 = sha256.update(salted).digest('hex');
        let result = sha256.update(level2).digest('hex');

        return result;
    },
    encrypt: (value: string, password: string) => {
        const cipher = createCipher('aes-128-cbc', password);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
    },
    decrypt: (value: string, password: string) => {
        const decipher = createDecipher('aes-128-cbc', password);
        let decrypted = decipher.update(value, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    },
    isJson: (str: string) => {
        try {
            JSON.parse(str);

            return true;
        } catch (error) {
            return false;
        }
    }
};

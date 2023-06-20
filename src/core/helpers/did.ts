import { Request } from 'src/types/core';
import { STORAGE_KEYS } from 'src/utils/storage';
import utils from 'src/utils';
import { storage } from '../runtime';
import Wallet, { Types } from 'did-hd-wallet';

interface SigningKeyData extends Request {
    request: {
        type?: string;
        currentDID: string;
        keyString: string;
    };
}

interface ChangeDIDData extends Request {
    request: {
        did: string;
    };
}

const setDID = ({ request, data }: ChangeDIDData) => {
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

    return true;
};

const setSingingKey = async ({ request, data }: SigningKeyData) => {
    if (request.type === 'memonic') {
        const wallet = new Wallet(Types.MNEMONIC, request.keyString);

        const { privateKey: issuerPrivateKey, did: issuerDID }: any = await wallet.getChildKeys(
            'm/256/256/1'
        );
        const { privateKey: holderPrivateKey, did: holderDID }: any = await wallet.getChildKeys(
            'm/256/256/2'
        );

        if (holderDID === request.currentDID) {
            request.keyString = holderPrivateKey;
        } else if (issuerDID === request.currentDID) {
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

    return kid;
};

export { setDID, setSingingKey };

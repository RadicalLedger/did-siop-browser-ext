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
    let private_key = request.keyString;

    if (request.type === 'mnemonic') {
        const wallet = new Wallet(Types.MNEMONIC, request.keyString);

        const { privateKey: issuerPrivateKey, did: issuerDID }: any = await wallet.getChildKeys(
            'm/256/256/1'
        );
        const { privateKey: holderPrivateKey, did: holderDID }: any = await wallet.getChildKeys(
            'm/256/256/2'
        );

        if (holderDID === request.currentDID) {
            private_key = holderPrivateKey;
        } else if (issuerDID === request.currentDID) {
            private_key = issuerPrivateKey;
        } else {
            private_key = holderPrivateKey;
        }
    }

    let kid = data.provider.addSigningParams(private_key);
    let signinInfo = {
        key: private_key,
        kid: kid
    };

    if (request.type === 'mnemonic') signinInfo['mnemonic'] = request.keyString;

    data.signingInfoSet.push(signinInfo);

    let encryptedSigningInfo = utils.encrypt(
        JSON.stringify(data.signingInfoSet),
        data.loggedInState
    );

    storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

    return kid;
};

export { setDID, setSingingKey };

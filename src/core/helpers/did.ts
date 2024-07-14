import { Request } from 'src/types/core';
import { STORAGE_KEYS } from 'src/utils/storage';
import utils from 'src/utils';
import { storage } from '../runtime';
import Wallet from 'did-hd-wallet';
import KeyMethod from 'zedeid-did-method-key';
import MoonMethod from 'zedeid-did-method-moon';

interface SigningKeyData extends Request {
    request: {
        type?: string;
        didAddress?: string;
        chainCode?: string;
        currentDID: string;
        keyString: string;
    };
}

interface DidPathData extends Request {
    request: {
        type?: string;
        keyString: string;
        chainCode: string;
    };
}

interface ChangeDIDData extends Request {
    request: {
        did: string;
    };
}

const setDID = ({ request, data }: ChangeDIDData) => {
    let reset = true;

    /* store did */
    let encryptedDID = utils.encrypt(request.did, data.loggedInState);
    storage.set({ [STORAGE_KEYS.userDID]: encryptedDID });

    if (data.signingInfoSet?.length > 0) {
        for (const signinInfo of data.signingInfoSet) {
            let chainCode = signinInfo?.chainCode || 'm/256/256/2';

            /* find the relevant key for the given DID */
            const wallet = new Wallet();
            wallet.fromSeed(signinInfo.key);
            wallet.derivePath(chainCode).then((result) => {
                if (result.did == request.did) {
                    data.provider.addSigningParams(signinInfo.key);
                    reset = false;
                }
            });
        }
    }

    /* reset singing info set */
    if (reset) {
        data.signingInfoSet = [];
        let encryptedSigningInfo = utils.encrypt(
            JSON.stringify(data.signingInfoSet),
            data.loggedInState
        );

        storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });
    }

    return true;
};

const setSingingKey = async ({ request, data }: SigningKeyData) => {
    let private_key = request.keyString;
    let did = request?.didAddress || request.currentDID;
    let chainCode = request?.chainCode;
    const didMethod = did.split(':')[1];

    if (request.type === 'mnemonic') {
        const wallet =
            didMethod === 'key' ? new Wallet() : new Wallet(new MoonMethod(did.split(':')[2]));
        wallet.fromSeed(wallet.mnemonicToSeed(request.keyString));

        if (chainCode) {
            const { privateKey: privateKey, did: didAddress }: any = await wallet.derivePath(
                request.chainCode
            );

            private_key = privateKey;
            did = didAddress;
        } else {
            const { privateKey: issuerPrivateKey, did: issuerDID }: any = await wallet.derivePath(
                'm/256/256/1'
            );
            const { privateKey: holderPrivateKey, did: holderDID }: any = await wallet.derivePath(
                'm/256/256/2'
            );

            private_key = holderPrivateKey;
            did = holderDID;
            chainCode = 'm/256/256/2';

            if (issuerDID === request.currentDID) {
                private_key = issuerPrivateKey;
                did = issuerDID;
                chainCode = 'm/256/256/1';
            }
        }
    }

    /* set did address */
    setDID({ request: { did }, data });

    /* set private key */
    let kid = data?.provider?.addSigningParams(private_key);
    let signinInfo = {
        key: private_key,
        kid,
        chainCode
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

const resolveSigningKey = async ({ request, data }: DidPathData) => {
    let wallet = new Wallet();
    console.log(request);
    if (request.type === 'mnemonic') {
        wallet.fromSeed(wallet.mnemonicToSeed(request.keyString));
    } else {
        wallet.fromSeed(request.keyString);
    }

    const { did }: any = await wallet.derivePath(request.chainCode);

    return did;
};

const deriveIssuerHolderDIDFromMnemonic = async (mnemonic: string, method: any) => {
    const wallet = new Wallet(method);
    wallet.fromSeed(wallet.mnemonicToSeed(mnemonic));
    const {
        publicKey: issuerPublicKey,
        privateKey: issuerPrivateKey,
        did: issuerDID,
        didDocument: issuerDIDDocument
    } = await wallet.derivePath('m/256/256/1');
    const issuerVerificationKey = await new KeyMethod().createVerificationMethod(issuerPrivateKey);
    const {
        publicKey: holderPublicKey,
        privateKey: holderPrivateKey,
        did: holderDID,
        didDocument: holderDIDDocument
    } = await wallet.derivePath('m/256/256/2');
    const holderVerificationKey = await new KeyMethod().createVerificationMethod(holderPrivateKey);
    return {
        issuerDID,
        issuerPublicKey,
        issuerPrivateKey,
        issuerDIDDocument,
        holderDID,
        holderPublicKey,
        holderPrivateKey,
        holderDIDDocument,
        issuerVerificationKey,
        holderVerificationKey
    };
};

export { setDID, setSingingKey, resolveSigningKey, deriveIssuerHolderDIDFromMnemonic };

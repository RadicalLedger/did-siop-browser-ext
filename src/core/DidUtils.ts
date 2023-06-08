import Wallet, { Types, generateMnemonic } from 'did-hd-wallet';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import VCSD from 'sd-vc-lib';

const createKeyDid = async function (network: string) {
    const resolver_url = 'https://www.offchaindids.zedeid.com/v2/did/';
    const mnemonic = generateMnemonic(128);

    const wallet = new Wallet(Types.MNEMONIC, mnemonic);
    const ed = new VCSD.utils.ed25519();

    const {
        publicKey: holderPublicKey,
        privateKey: holderPrivateKey,
        did: holderDID,
        verificationKey: holderVerificationKey
    }: any = await wallet.getChildKeys(
        process.env.REACT_APP_HOLDER_DERIVATION_PATH || 'm/256/256/2'
    );

    const holderChallengeResponse = await axios.post(`${resolver_url}`, {
        did: holderDID
    });
    const { challenge: holderChallenge } = jwt.decode(
        holderChallengeResponse.data.challengeToken
    ) as any;

    const holderResponse = await axios.post(`${resolver_url}`, {
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
    });

    if (holderResponse?.data?.status !== 'success') {
        console.error({
            open: true,
            title: 'Error',
            content: 'Holder DID document creation failed'
        });

        return {};
    }

    return {
        did: holderDID,
        privateKey: holderPrivateKey
    };
};

export const DidCreators = {
    key: createKeyDid
    // eth: createEthDid
};

import EthrDID from 'ethr-did';
import W3 from 'web3';
const nacl = require('tweetnacl');
import { encode as multibaseEncode } from 'multibase';
import { addPrefix as mutlicodeAddPrefix } from 'multicodec';
import * as base58 from 'bs58';
import Wallet, { Types, generateMnemonic } from 'did-hd-wallet';
import { publicKeyCreate, ecdsaSign } from 'secp256k1';
import axios from 'axios';
import jwt from 'jsonwebtoken';

/* const createEthrDid = async function (network: string) {
    const networks = {
        mainnet: 'https://mainnet.infura.io/v3/e0a6ac9a2c4a4722970325c36b728415',
        rinkeby: 'https://rinkeby.infura.io/v3/e0a6ac9a2c4a4722970325c36b728415',
        ropsten: 'https://ropsten.infura.io/v3/e0a6ac9a2c4a4722970325c36b728415',
        goerli: 'https://goerli.infura.io/v3/e0a6ac9a2c4a4722970325c36b728415',
        kovan: 'https://kovan.infura.io/v3/e0a6ac9a2c4a4722970325c36b728415'
    };

    const ethrProvider = new W3.providers.HttpProvider(networks[network]);
    const w3 = new W3();
    const acc = w3.eth.accounts.create();
    const ethrDid = new EthrDID({
        address: acc.address,
        privateKey: acc.privateKey,
        provider: ethrProvider
    });

    return {
        did: ethrDid.did,
        privateKey: acc.privateKey.replace('0x', '')
    };
}; */

const createEthrDid = async function (network: string) {
    const resolver_url = 'https://www.offchaindids.zedeid.com/v2/did/';
    const mnemonic = generateMnemonic(128);

    const wallet = new Wallet(Types.MNEMONIC, mnemonic);

    const { privateKey: holderPrivateKey, did: holderDID } = wallet.getChildKeys('m/256/256/2');

    const holderChallengeResponse = await axios.post(`${resolver_url}`, {
        did: holderDID
    });
    const { challenge: holderChallenge } = jwt.decode(
        holderChallengeResponse.data.challengeToken
    ) as any;

    const holderResponse = await axios.post(`${resolver_url}`, {
        did: holderDID,
        seed: holderPrivateKey,
        challengeResponse: {
            publicKey: Buffer.from(
                publicKeyCreate(Buffer.from(holderPrivateKey as string, 'hex'))
            ).toString('hex'),
            cipherText: Buffer.from(
                ecdsaSign(
                    Buffer.from(holderChallenge, 'hex'),
                    Buffer.from(holderPrivateKey as string, 'hex')
                ).signature
            ).toString('hex'),
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

const createKeyDid = async function () {
    let keyPair = nacl.sign.keyPair();
    let methodSpecificBytes = Buffer.from(
        multibaseEncode('base58btc', mutlicodeAddPrefix('ed25519-pub', keyPair.publicKey))
    );
    let did = 'did:key:' + methodSpecificBytes.toString();
    let privateKeyString = base58.encode(keyPair.secretKey);

    return {
        did,
        privateKey: privateKeyString
    };
};

export const DidCreators = {
    ethr: createEthrDid,
    key: createKeyDid
};

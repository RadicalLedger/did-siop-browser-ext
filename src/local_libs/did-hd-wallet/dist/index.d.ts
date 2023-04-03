export interface Keys {
    privateKey: string | undefined;
    publicKey: string;
    chainCode: string;
    base58: string;
    wif: string;
    ethAddress: string;
    did: string;
}
export declare enum Types {
    SEED = 0,
    MNEMONIC = 1,
    WIF = 2,
    BASE58 = 3
}
export default class Wallet {
    private masterNode;
    private mnemonic;
    constructor(type: Types, value: string);
    getMasterKeys(): Keys;
    getMasterPrivateKey(): string | undefined;
    getMasterPublicKey(): string;
    getMasterChainCode(): string;
    getMasterMnemonic(): string | undefined;
    getChildKeys(path: string): Keys;
    getBase58(): string;
    getWIF(): string;
}
export declare function getSeedFromMnemonic(mnemonic: string): string;
export declare function publicKeyToETH(publicKey: string): string;
export declare function getDID(address: string): string;
export declare function createRandomETHDID(): {
    privateKey: string;
    did: string;
};
export declare function createETHDIDFromPrivateKey(privateKey: string): {
    privateKey: string;
    did: string;
};
export { generateMnemonic, validateMnemonic } from 'bip39';

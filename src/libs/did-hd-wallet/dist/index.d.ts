export interface VerificationKey {
    id: string;
    type: string;
    controller: string;
    publicKeyBase58: string;
    privateKeyBase58?: string;
}
export interface Keys {
    privateKey: string | undefined;
    publicKey: string;
    verificationKey: VerificationKey;
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
    getMasterKeys(): Promise<Keys>;
    getMasterPrivateKey(): string | undefined;
    getMasterMnemonic(): string | undefined;
    getChildKeys(path: string): Promise<Keys>;
}
export declare function getSeedFromMnemonic(mnemonic: string): string;
export declare function createVerificationMethod(
    seed: any
): Promise<
    | import('@transmute/ed25519-key-pair').JsonWebKey2020
    | import('@transmute/ed25519-key-pair').Ed25519VerificationKey2018
>;
export { generateMnemonic, validateMnemonic } from 'bip39';

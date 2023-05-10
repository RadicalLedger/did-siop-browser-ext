import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
import { VerifiablePresentation } from '@transmute/vc.js/dist/types/VerifiablePresentation';
import { Ed25519VerificationKey2018 } from '@transmute/ed25519-signature-2018';
declare function base64UrlEncode(unencoded: string): string;
declare function base64UrlDecode(encoded: string): string;
declare function blind(data: string, key: string): string;
declare function getVerificationKey({
    seed,
    includePrivateKey,
    returnKey
}: {
    seed: string;
    includePrivateKey?: boolean;
    returnKey?: boolean;
}): Promise<
    | Ed25519VerificationKey2018
    | import('@transmute/ed25519-key-pair').JsonWebKey2020
    | import('@transmute/ed25519-key-pair').Ed25519VerificationKey2018
>;
declare const _default: {
    base64UrlEncode: typeof base64UrlEncode;
    base64UrlDecode: typeof base64UrlDecode;
    blind: typeof blind;
    sortObject: (object: any) => {};
    privateKeyToDoc: (privateKey: string) => Promise<{
        privateKey: string;
        publicKey: string;
        DID: string;
    }>;
    checkVcMetaData: (vc: VerifiableCredential) => void;
    checkVpMetaData: (vp: VerifiablePresentation) => void;
    getVerificationKey: typeof getVerificationKey;
};
export default _default;

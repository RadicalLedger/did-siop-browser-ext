import verifiable from './verifiable';
import utils from './utils';
import functions from './functions';
declare const VCSD: {
    verifiable: {
        credential: {
            create: ({
                issuerPrivateKey,
                issuanceDate,
                holderPublicKey,
                documentLoader,
                credential,
                suite
            }: import('./types/credential.type').CreateProps) => Promise<
                import('@transmute/vc.js/dist/types/VerifiableCredential').VerifiableCredential
            >;
            verify: ({
                suite,
                vc,
                documentLoader,
                issuerPublicKey,
                holderPublicKey
            }: import('./types/credential.type').VerifyProps) => Promise<{
                verified: any;
            }>;
        };
        presentation: {
            create: ({
                suite,
                challenge,
                issuanceDate,
                domain,
                documentLoader,
                holderPrivateKey,
                verifiableCredential,
                masks
            }: import('./types/presentation.type').CreateProps) => Promise<
                import('@transmute/vc.js/dist/types/VerifiablePresentation').VerifiablePresentation
            >;
            verify: ({
                suite,
                challenge,
                domain,
                vp,
                documentLoader,
                issuerPublicKey,
                holderPublicKey
            }: import('./types/presentation.type').VerifyProps) => Promise<
                import('@transmute/vc.js/dist/types').VerificationResult
            >;
        };
    };
    utils: {
        mask: {
            create: ({
                mask,
                credentialSubject,
                holderPublicKey
            }: import('./types/utils.type').MaskProps) => {
                maskedClaims: {};
                maskedMasks: {};
            };
            full: ({
                mask,
                credentialSubject,
                holderPublicKey
            }: import('./types/utils.type').MaskProps) => {
                maskedClaims: {};
                maskedMasks: {};
            };
        };
        signature: {
            generate: ({
                data,
                privateKey
            }: import('./types/utils.type').GenerateSignatureProps) => string;
            verify: ({
                data,
                signature,
                publicKey
            }: import('./types/utils.type').VerifySignatureProps) => any;
        };
        ed25519: typeof import('./utils/ed25519').default;
    };
    functions: {
        base64UrlEncode: (unencoded: string) => string;
        base64UrlDecode: (encoded: string) => string;
        blind: (data: string, key: string) => string;
        sortObject: (object: any) => {};
        privateKeyToDoc: (privateKey: string) => Promise<{
            privateKey: string;
            publicKey: string;
            DID: string;
        }>;
        checkVcMetaData: (
            vc: import('@transmute/vc.js/dist/types/VerifiableCredential').VerifiableCredential
        ) => void;
        checkVpMetaData: (
            vp: import('@transmute/vc.js/dist/types/VerifiablePresentation').VerifiablePresentation
        ) => void;
        getVerificationKey: ({
            seed,
            includePrivateKey,
            returnKey
        }: {
            seed: string;
            includePrivateKey?: boolean;
            returnKey?: boolean;
        }) => Promise<
            | import('@transmute/ed25519-signature-2018').Ed25519VerificationKey2018
            | import('@transmute/ed25519-key-pair').JsonWebKey2020
            | import('@transmute/ed25519-key-pair').Ed25519VerificationKey2018
        >;
    };
};
export { verifiable, utils, functions };
export default VCSD;

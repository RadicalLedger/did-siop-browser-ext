import ed25519 from './ed25519';
declare const _default: {
    mask: {
        create: ({
            mask,
            credentialSubject,
            holderPublicKey
        }: import('../types/utils.type').MaskProps) => {
            maskedClaims: {};
            maskedMasks: {};
        };
        full: ({
            mask,
            credentialSubject,
            holderPublicKey
        }: import('../types/utils.type').MaskProps) => {
            maskedClaims: {};
            maskedMasks: {};
        };
    };
    signature: {
        generate: ({
            data,
            privateKey
        }: import('../types/utils.type').GenerateSignatureProps) => string;
        verify: ({
            data,
            signature,
            publicKey
        }: import('../types/utils.type').VerifySignatureProps) => any;
    };
    ed25519: typeof ed25519;
};
export default _default;

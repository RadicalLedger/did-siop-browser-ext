declare const _default: {
    credential: {
        create: ({
            issuerPrivateKey,
            issuanceDate,
            holderPublicKey,
            documentLoader,
            credential,
            suite
        }: import('../types/credential.type').CreateProps) => Promise<
            import('@transmute/vc.js/dist/types/VerifiableCredential').VerifiableCredential
        >;
        verify: ({
            suite,
            vc,
            documentLoader,
            issuerPublicKey,
            holderPublicKey
        }: import('../types/credential.type').VerifyProps) => Promise<{
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
        }: import('../types/presentation.type').CreateProps) => Promise<
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
        }: import('../types/presentation.type').VerifyProps) => Promise<
            import('@transmute/vc.js/dist/types').VerificationResult
        >;
    };
};
export default _default;

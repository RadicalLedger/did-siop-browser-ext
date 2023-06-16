import { VerifiablePresentation } from '@transmute/vc.js/dist/types/VerifiablePresentation';
import { CreateProps, VerifyProps } from '../types/presentation.type';
declare const _default: {
    create: ({
        suite,
        challenge,
        issuanceDate,
        domain,
        documentLoader,
        holderPrivateKey,
        verifiableCredential,
        masks
    }: CreateProps) => Promise<VerifiablePresentation>;
    verify: ({
        suite,
        challenge,
        domain,
        vp,
        documentLoader,
        issuerPublicKey,
        holderPublicKey
    }: VerifyProps) => Promise<import('@transmute/vc.js/dist/types').VerificationResult>;
};
export default _default;

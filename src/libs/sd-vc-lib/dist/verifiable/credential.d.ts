import { CreateProps, VerifyProps } from '../types/credential.type';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
declare const _default: {
    create: ({
        issuerPrivateKey,
        issuanceDate,
        holderPublicKey,
        documentLoader,
        credential,
        suite
    }: CreateProps) => Promise<VerifiableCredential>;
    verify: ({
        suite,
        vc,
        documentLoader,
        issuerPublicKey,
        holderPublicKey
    }: VerifyProps) => Promise<{
        verified: any;
    }>;
};
export default _default;

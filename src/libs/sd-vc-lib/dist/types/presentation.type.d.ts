import { Suite } from '@transmute/vc.js/dist/types/Suite';
import { DocumentLoader } from '@transmute/vc.js/dist/types/DocumentLoader';
import { Claims, Mask } from './utils.type';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
import { VerifiablePresentation } from '@transmute/vc.js/dist/types/VerifiablePresentation';

export interface Credential {
    '@context': any[];
    id: string;
    issuanceDate: string;
    type: string | string[];
    issuer: string;
    credentialSubject: any;
}

export interface CreateProps {
    holderPrivateKey: string;
    documentLoader: DocumentLoader;
    verifiableCredential: VerifiableCredential[];
    challenge?: string;
    domain?: string;
    suite?: Suite;
    issuanceDate?: string;
    masks?: Mask[];
}

export interface VerifyProps {
    issuerPublicKey: string;
    holderPublicKey?: string;
    documentLoader: DocumentLoader;
    vp: VerifiablePresentation;
    challenge?: string;
    domain?: string;
    suite?: Suite;
}

import { DocumentLoader } from '@transmute/vc.js/dist/types/DocumentLoader';
import { Claims, Mask } from './utils.type';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';
import { Suite } from '@transmute/vc.js/dist/types/Suite';

export interface Credential {
    '@context': any[];
    id: string;
    issuanceDate: string;
    type: string | string[];
    issuer: string;
    credentialSubject: any;
    mask?: any;
}

export interface CreateProps {
    issuanceDate?: string;
    issuerPrivateKey: string;
    holderPublicKey: string;
    documentLoader: DocumentLoader;
    credential: Credential;
    suite?: Suite;
}

export interface VerifyProps {
    issuerPublicKey?: string;
    holderPublicKey: string;
    documentLoader: DocumentLoader;
    vc: VerifiableCredential;
    suite?: Suite;
}

import { Credential } from './credential.type';

export interface Claims {
    [key: string | number]: any;
}

export interface Mask {
    [key: string | number]: any;
}

export interface MaskCredential {
    type: string | string[];
    issuer: any;
    credentialSubject: Claims;
}

export interface MaskPresentation {
    type: string | string[];
    holder: any;
    verifiableCredential: Claims;
}

export interface MaskProps {
    mask: Mask;
    credentialSubject: Claims;
    holderPublicKey: string;
}

export interface VerifySignatureProps {
    data: MaskCredential | MaskPresentation;
    signature: string;
    publicKey: string;
}

export interface GenerateSignatureProps {
    data: Claims;
    privateKey: string;
}

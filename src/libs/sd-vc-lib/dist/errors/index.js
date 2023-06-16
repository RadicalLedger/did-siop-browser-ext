'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ERRORS = Object.freeze({
    DID_PUBLIC_KEY_MISMATCH: 'Did does not match given public key',
    INVALID_DID_ERROR: 'Invalid did',
    INVALID_DOCUMENT: 'Invalid did document',
    TYPE_NOT_VALID: 'Document type not valid',
    NO_ISSUER: 'Issuer information is missing',
    NO_ISSUER_DID: 'Issuer did is missing',
    INVALID_ISSUER_PUBLIC_KEY: 'Issuer public key is not valid',
    INVALID_ISSUER_PRIVATE_KEY: 'Issuer private key is not valid',
    NO_ISSUER_PUBLIC_KEY: 'Issuer public key is missing',
    NO_SUBJECT: 'Subject information is missing',
    NO_SUBJECT_DID: 'Subject did is missing',
    NO_SUBJECT_PUBLIC_KEY: 'Subject public key is missing',
    NO_CLAIMS: 'Claim information is missing',
    NO_CREDENTIALS: 'Credential information is missing',
    NO_PROOF_VC: 'Credential proof is missing',
    NO_PROOF_VP: 'Presentation proof is missing',
    MASKING_ERROR: 'Masking failed',
    SIGNING_ERROR: 'Signing failed',
    INVALID_HOLDER_PRIVATE_KEY: 'Holder private key is not valid',
    INVALID_HOLDER_PUBLIC_KEY: 'Holder public key is not valid',
    INVALID_VC_PROOF: 'VC proof is invalid',
    INVALID_VP_PROOF: 'VP proof is invalid',
    INVALID_SIGNATURE: 'Proof is invalid',
    UNKNOWN_ERROR: 'Unknown error',
    FAILED_MASK_VERIFICATION: 'Failed to verify masked verifiable credential'
});
exports.default = ERRORS;

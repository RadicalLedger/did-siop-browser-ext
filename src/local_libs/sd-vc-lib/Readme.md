# sd-vc-lib

Package to issue, present and verify selectively disclosable verifiable credentials.

## Breaking changes

Credentials and presentations issued with v2.0.0 will no longer be valid with v3.0.0

## Installation

-   Node.js 16.0+ is required.

To install locally (for development):

```bash
git clone https://github.com/RadicalLedger/zedeid-vcsd-lib-core.git
cd zedeid-vcsd-lib-core

yarn install or npm install
yarn dev or npm run dev
```

## Usage

### Create Verifiable Credential

Create selectively disclosure verifiable credential for given claims.

```ts
import { verifiable } from 'sd-vc-lib';

verifiable.credential.create({
    issuerPrivateKey, // issuer's Ethereum private key in hex.
    issuanceDate, // (optional) issuance date in ISO format YYYY-MM-DDTHH:mm:ss
    holderPublicKey, // holders's Ethereum public key in hex.
    credential, // credential need to be singed as key value pairs,
    documentLoader, // load the document for the given DID.
    suite // (optional) crypto suit used to create the verifiable credential.
});
```

### Verify verifiable credential

verify the authenticity of a verifiable credential.

```ts
import { verifiable } from 'sd-vc-lib';

verifiable.credential.verify({
    vc, // singed credential need to be verified.
    documentLoader, // load the document for the given DID.
    holderPublicKey, // holders's Ethereum public key in hex.
    issuerPublicKey, // (optional) issuer's Ethereum public key in hex.
    suite // (optional) crypto suit used to create the verifiable credential.
});
```

### Create Verifiable presentation

Create a verifiable presentation with a given list of selectively disclosure verifiable credentials.

```ts
import { verifiable } from 'sd-vc-lib';

verifiable.presentation.create({
    holderPrivateKey, // holder's Ethereum private key in hex.
    verifiableCredential, // array of verifiable credentials.
    mask, // (optional) array of mask credentials for each verifiable credential in key pair format or an empty object.
    issuanceDate, // (optional) issuance date in ISO format YYYY-MM-DDTHH:mm:ss
    documentLoader, // (optional) load the document for the given DID.
    suite, // (optional) crypto suit used to create the verifiable credential.
    challenge, // (optional) random string ( eg: fcc8b78e-ecca-426a-a69f-8e7c927b845f )
    domain // (optional) domain value ( eg: www.example.com )
});
```

### Verify verifiable presentation

verify the authenticity of a verifiable presentation.

```ts
import { verifiable } from 'sd-vc-lib';

verifiable.presentation.verify({
    vp, // singed credential need to be verified.
    documentLoader, // load the document for the given DID.
    issuerPublicKey, // issuer's Ethereum public key in hex.
    holderPublicKey, // (optional) holders's Ethereum public key in hex.
    suite, // (optional) crypto suit used to create the verifiable credential.
    challenge, // (optional) random string ( eg: fcc8b78e-ecca-426a-a69f-8e7c927b845f )
    domain // (optional) domain value ( eg: www.example.com )
});
```

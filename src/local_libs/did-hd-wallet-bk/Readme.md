# did-hd-wallet

A wrapper package of bip32 and bip39 to generate ethr decentralized IDs

## Inastallation

1. Clone repository
2. run _npm run build_
3. npm install < local repository directory >

## Usage

### generateMnemonic

import { generateMnemonic } from 'did-hd-wallet';

generate random mnemonic.

#### Parameters

1. strength : number - Integer between 128 - 256.

#### Returns

1. mnemonic: string - mnemonic words range from 12 to 24.

### validateMnemonic

import { validateMnemonic } from 'did-hd-wallet';

validate mnemonic string.

#### Parameters

1. mnemonic : string - Mnemonic string.

#### Returns

1. validity: boolean - whether mnemonic string is valid or not.

### getSeedFromMnemonic

import { getSeedFromMnemonic } from 'did-hd-wallet';

get seed from mnemonic words.

#### Parameters

1. mnemonic : string - valid mnemonic phrase.

#### Returns

1. seed: string - hex encoded seed.

### publicKeyToETH

import { publicKeyToETH } from 'did-hd-wallet';

get ethereum address of a public key.

#### Parameters

1. publicKey : string - public key.

#### Returns

1. ethereumAddress: string - Ethereum address corresponding to the public key.

### getDID

import { getDID } from 'did-hd-wallet';

get ethereum decentralized id of an Ethereum address.

#### Parameters

1. address : string - Ethereum adress of which the DID is needed.

#### Returns

1. DID: string - Ethereum DID.

### createRandomETHDID

import { createRandomETHDID } from 'did-hd-wallet';

generate random Ethereum address.

#### Parameters

none

#### Returns

1. ethereumAddress: string - random Ethereum address.

### createETHDIDFromPrivateKey

import { createETHDIDFromPrivateKey } from 'did-hd-wallet';

get ethereum address from a private key.

#### Parameters

1. privateKey : string - valid private key.

#### Returns

1. ethereumAddress: string - Ethereum address corresponding to the private key.

### Wallet Class

import Wallet from 'did-hd-wallet';

#### Public methods

##### getMasterPrivateKey

##### Parameters

None

##### Returns

1. masterPrivateKey: string - hex encoded master private key.

##### getMasterPublicKey

##### Parameters

None

##### Returns

1. masterPublicKey: string - hex encoded master public key.

##### getMasterChainCode

##### Parameters

None

##### Returns

1. masterChainCode: string - hex encoded master chain code.

##### getMasterMnemonic

##### Parameters

None

##### Returns

1. masterMnemonic: string - master mnemonic phrase.

##### getChildKeys

##### Parameters

1. path: string - valid derivation path.

##### Returns

1. childKeys: object - JS object containing child private key, child public key, child chain code, base58 representation of child node, WIF representation of child node, Ethereum address and ETH DID .

##### getMasterKeys

##### Parameters

None

##### Returns

1. childKeys: object - JS object containing master private key, master public key, master chain code, base58 representation of master node, WIF representation of master node, Ethereum master Ethereum address and master ETH DID..

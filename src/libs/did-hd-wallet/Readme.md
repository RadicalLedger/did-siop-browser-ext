# did-hd-wallet

A wrapper package of bip32 and bip39 to generate key decentralized IDs

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

1. childKeys: object - JS object containing child private key, child public key, verification method representation of child node, Key address and KEY DID .

##### getMasterKeys

##### Parameters

None

##### Returns

1. childKeys: object - JS object containing master private key, master public key, verification method representation of master node, Key master Key address and master KEY DID..

interface SigningKeys {
    mnemonic?: string;
    kid: string;
    key: string;
}

interface ResolveKeyData {
    type: 'mnemonic' | 'private-key' | '';
    key: string;
}

interface SetKeyDIDData {
    type: 'mnemonic' | 'private-key' | '';
    key: string;
    chain_code?: string;
    did?: string;
}

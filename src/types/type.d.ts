interface SigningKeys {
    mnemonic?: string;
    kid: string;
    key: string;
}

interface ResolveKeyData {
    type: string;
    key: string;
}

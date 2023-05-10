/// <reference types="node" />
export default class Ed25519 {
    private ed;
    constructor();
    /**
     * sign message with private key
     *
     * @param message - Buffer | Uint8Array
     * @param privateKey - Buffer | Uint8Array
     *
     * @returns - Signed buffer
     */
    sign(message: Buffer | Uint8Array, privateKey: Buffer | Uint8Array): any;
    /**
     * verify message with public key
     *
     * @param signature - Buffer | Uint8Array | Hex
     * @param message - Buffer | Uint8Array
     * @param publicKey - Hex string
     *
     * @returns - boolean
     */
    verify(
        signature: Buffer | Uint8Array | string,
        message: Buffer | Uint8Array,
        publicKey: string
    ): any;
}

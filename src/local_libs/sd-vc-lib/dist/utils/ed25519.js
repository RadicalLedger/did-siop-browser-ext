'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-ignore
const elliptic_1 = require('elliptic');
class Ed25519 {
    constructor() {
        this.ed = new elliptic_1.eddsa('ed25519');
    }
    /**
     * sign message with private key
     *
     * @param message - Buffer | Uint8Array
     * @param privateKey - Buffer | Uint8Array
     *
     * @returns - Signed buffer
     */
    sign(message, privateKey) {
        const pvt = this.ed.keyFromSecret(privateKey);
        return pvt.sign(message);
    }
    /**
     * verify message with public key
     *
     * @param signature - Buffer | Uint8Array | Hex
     * @param message - Buffer | Uint8Array
     * @param publicKey - Hex string
     *
     * @returns - boolean
     */
    verify(signature, message, publicKey) {
        const pub = this.ed.keyFromPublic(publicKey, 'hex');
        return pub.verify(message, signature);
    }
}
exports.default = Ed25519;

'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const sha_js_1 = __importDefault(require('sha.js'));
const errors_1 = __importDefault(require('../errors'));
const utils_1 = __importDefault(require('../utils'));
const buffer_1 = require('buffer');
/**
 * Generates a hex signature proof for a given verifiable credential or presentation
 *
 * @param {any} data - verifiable credential or presentation in json format.
 * @param {string} privateKey - private key of the issuer of the verifiable credential or presentation.
 *
 * @returns {string} - signature proof as a hex string.
 */
const generateSignature = ({ data, privateKey }) => {
    const ed = new utils_1.default.ed25519();
    const privateKeyBuffer = buffer_1.Buffer.from(privateKey, 'hex');
    const dataString = JSON.stringify(data);
    const dataStringHash = new sha_js_1.default.sha256().update(dataString).digest('hex');
    const dataStringHashBuffer = buffer_1.Buffer.from(dataStringHash, 'hex');
    const signature = ed.sign(dataStringHashBuffer, privateKeyBuffer).toHex();
    return signature;
};
/**
 * Verify the given signature proof of a verifiable credential or presentation
 *
 * @param {MaskCredential | MaskPresentation} data - keys and values should be mask or a empty object.
 * @param {string} signature - signature proof as a hex string.
 * @param {string} publicKey - issuer's / holder's Ethereum public key in hex.
 *
 * @return {boolean}  validated result in boolean format.
 */
const verifySignature = ({ data, signature, publicKey }) => {
    try {
        const ed = new utils_1.default.ed25519();
        const vcString = JSON.stringify(data);
        const vcHash = new sha_js_1.default.sha256().update(vcString).digest('hex');
        const vcHashBuffer = buffer_1.Buffer.from(vcHash, 'hex');
        const result = ed.verify(signature, vcHashBuffer, publicKey);
        if (result === true) return result;
        throw Error(errors_1.default.FAILED_MASK_VERIFICATION);
    } catch (error) {
        throw Error(errors_1.default.INVALID_SIGNATURE);
    }
};
exports.default = { generate: generateSignature, verify: verifySignature };

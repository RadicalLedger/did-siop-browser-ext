'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const ed25519_signature_2018_1 = require('@transmute/ed25519-signature-2018');
const vc_js_1 = require('@transmute/vc.js');
const errors_1 = __importDefault(require('../errors'));
const utils_1 = __importDefault(require('../utils'));
const functions_1 = __importDefault(require('../functions'));
const credential_1 = __importDefault(require('./credential'));
const base_58_1 = __importDefault(require('base-58'));
const buffer_1 = require('buffer');
/**
 * Generates a signed presentation for given verifiable credentials using a private key.
 *
 * @param {string} holderPrivateKey - issuer's Ethereum private key in hex.
 * @param {DocumentLoader} documentLoader - load the document for the given DID.
 * @param {VerifiableCredential[]} verifiableCredential - array of verifiable credentials
 * @param {Mask[]} mask - array of mask credentials for each verifiable credential in key pair format or an empty object.
 * @param {string} issuanceDate - issuance date in ISO format YYYY-MM-DDTHH:mm:ss
 * @param {string} challenge - random string ( eg: fcc8b78e-ecca-426a-a69f-8e7c927b845f )
 * @param {string} domain - domain value ( eg: www.example.com )
 * @param {Suite} suite - crypto suit used to create the verifiable credential.
 *
 * @return {VerifiablePresentation} - signed verifiable presentation of the given verifiable credentials.
 */
const create = ({
    suite,
    challenge = 'fcc8b78e-ecca-426a-a69f-8e7c927b845f',
    issuanceDate = new Date().toISOString(),
    domain,
    documentLoader,
    holderPrivateKey,
    verifiableCredential = [],
    masks = []
}) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        /* extract data from private key */
        const holderDoc = yield functions_1.default.privateKeyToDoc(holderPrivateKey);
        /* create masked vc signed by holder */
        const maskedCredentials = yield Promise.all(
            verifiableCredential.map(
                (vc, index) =>
                    new Promise((resolve) =>
                        __awaiter(void 0, void 0, void 0, function* () {
                            const mask = masks[index];
                            /* remove selectiveDisclosureMetaData */
                            let credentialSubject = Object.assign({}, vc.credentialSubject);
                            delete credentialSubject.selectiveDisclosureMetaData;
                            /* create a fully masked and selectively masked credential subject */
                            const { maskedClaims, maskedMasks } = utils_1.default.mask.create({
                                mask,
                                credentialSubject,
                                holderPublicKey:
                                    holderDoc === null || holderDoc === void 0
                                        ? void 0
                                        : holderDoc.publicKey
                            });
                            /* update credential subject with masked claims */
                            vc.credentialSubject = Object.assign(
                                Object.assign({}, vc.credentialSubject),
                                maskedClaims
                            );
                            /* add selective disclosure meta data to the credential subject */
                            if (!vc.credentialSubject['selectiveDisclosureMetaData'])
                                vc.credentialSubject['selectiveDisclosureMetaData'] = {};
                            vc.credentialSubject['selectiveDisclosureMetaData']['mask'] =
                                maskedMasks;
                            /* delete vc.js proof since the data is altered by masking */
                            // delete vc.proof;
                            return resolve(vc);
                        })
                    )
            )
        );
        /* if a suite is not given use the default */
        if (!suite) {
            const keyPairIssuer = yield functions_1.default.getVerificationKey({
                seed: holderPrivateKey,
                returnKey: true,
                includePrivateKey: true
            });
            suite = new ed25519_signature_2018_1.Ed25519Signature2018({
                key: keyPairIssuer,
                date: issuanceDate
            });
        }
        const presentation = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
            verifiableCredential: maskedCredentials,
            holder: holderDoc === null || holderDoc === void 0 ? void 0 : holderDoc.DID
        };
        /* create the verifiable presentation */
        const result = yield vc_js_1.verifiable.presentation.create({
            presentation,
            format: ['vp'],
            documentLoader,
            challenge,
            domain,
            suite
        });
        return (
            ((_a = result === null || result === void 0 ? void 0 : result.items) === null ||
            _a === void 0
                ? void 0
                : _a[0]) || null
        );
    });
/**
 * Verify a signed verifiable credential
 *
 * @param {Suite} suite - crypto suit used to create the verifiable credential.
 * @param {string} challenge - random string ( eg: fcc8b78e-ecca-426a-a69f-8e7c927b845f ).
 * @param {string} domain - domain value ( eg: www.example.com ).
 * @param {string} issuerPublicKey - issuer's Ethereum public key in hex.
 * @param {string} holderPublicKey - holders's Ethereum public key in hex.
 * @param {DocumentLoader} documentLoader - to load the document for the given DID.
 * @param {VerifiablePresentation} vp - singed credential need to be verified.
 *
 * @return {boolean} - result in boolean format.
 */
const verify = ({
    suite = new ed25519_signature_2018_1.Ed25519Signature2018(),
    challenge = 'fcc8b78e-ecca-426a-a69f-8e7c927b845f',
    domain,
    vp,
    documentLoader,
    issuerPublicKey,
    holderPublicKey
}) =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        /* check essential data is present in vp */
        functions_1.default.checkVpMetaData(vp);
        /* extract data from verifiable presentation */
        const { verifiableCredential, holder } = vp;
        /* vc proof checking */
        /* get holder public key using document loader */
        if (!holderPublicKey) {
            /* load the document of the holder with holder DID */
            const documentLoaderResult = yield documentLoader(holder);
            const verificationMethod =
                (_c =
                    (_b =
                        documentLoaderResult === null || documentLoaderResult === void 0
                            ? void 0
                            : documentLoaderResult.document) === null || _b === void 0
                        ? void 0
                        : _b.verificationMethod) === null || _c === void 0
                    ? void 0
                    : _c[0];
            /* base58 to hex */
            holderPublicKey = buffer_1.Buffer.from(
                base_58_1.default.decode(
                    verificationMethod === null || verificationMethod === void 0
                        ? void 0
                        : verificationMethod.publicKeyBase58
                )
            ).toString('hex');
        }
        /* verify each verifiable credential */
        for (const vc of verifiableCredential) {
            try {
                const result = credential_1.default.verify({
                    vc,
                    documentLoader,
                    holderPublicKey,
                    issuerPublicKey,
                    suite
                });
                if (!result) throw Error(errors_1.default.INVALID_VC_PROOF);
            } catch (e) {
                throw Error(`At least one credential is not valid\n${e.message}`);
            }
        }
        /* check if any vc has selectiveDisclosureMetaData proof */
        if (
            verifiableCredential.filter((vc) => {
                var _a;
                return !!((_a = vc === null || vc === void 0 ? void 0 : vc.credentialSubject) ===
                    null || _a === void 0
                    ? void 0
                    : _a.selectiveDisclosureMetaData);
            }).length > 0
        ) {
            return { verified: true };
        }
        /* default presentation verification */
        return yield vc_js_1.verifiable.presentation.verify({
            presentation: vp,
            format: ['vp'],
            documentLoader,
            suite,
            challenge,
            domain
        });
    });
exports.default = { create, verify };

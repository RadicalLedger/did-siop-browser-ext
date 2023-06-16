'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const lodash_1 = __importDefault(require('lodash'));
const functions_1 = __importDefault(require('../functions'));
/**
 * Generate selective masked claim set of a partially masked claim set in sorted order
 *
 * @param {Mask} mask - keys and values should be mask or a empty object.
 * @param {Claims} credentialSubject - partially masked credentialSubject.
 * @param {string} holderPublicKey - holder's Ethereum public key in hex.
 *
 * @return {Claims}  selective masked credentialSubject.
 */
const createMask = ({ mask = {}, credentialSubject = {}, holderPublicKey }) => {
    if (lodash_1.default.isArray(credentialSubject)) {
        /* if the value is an array */
        const maskedClaims = [];
        const maskedMasks = {};
        for (let key = 0; key < credentialSubject.length; key++) {
            const maskValues = mask === null || mask === void 0 ? void 0 : mask[key];
            if (maskValues) {
                if (
                    credentialSubject === null || credentialSubject === void 0
                        ? void 0
                        : credentialSubject[key]
                ) {
                    try {
                        const maskedKey = functions_1.default.blind(
                            credentialSubject[key],
                            holderPublicKey
                        );
                        if (
                            lodash_1.default.isObject(
                                mask === null || mask === void 0 ? void 0 : mask[key]
                            ) &&
                            lodash_1.default.isObject(credentialSubject[key])
                        ) {
                            const result = createMask({
                                mask: mask === null || mask === void 0 ? void 0 : mask[key],
                                credentialSubject: credentialSubject[key],
                                holderPublicKey
                            });
                            maskedClaims.push(
                                result === null || result === void 0 ? void 0 : result.maskedClaims
                            );
                            if (
                                lodash_1.default.size(
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks
                                )
                            )
                                maskedMasks[key] =
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks;
                            continue;
                        }
                        maskedClaims.push(maskedKey);
                        maskedMasks[key] = true;
                    } catch (error) {
                        throw Error(`Masking failed\n${error.message}`);
                    }
                }
            } else {
                maskedClaims.push(credentialSubject[key]);
            }
        }
        return {
            maskedClaims: functions_1.default.sortObject(maskedClaims),
            maskedMasks: functions_1.default.sortObject(maskedMasks)
        };
    } else if (lodash_1.default.isObject(credentialSubject)) {
        /* if the value is an object */
        const maskedClaims = {};
        const maskedMasks = {};
        for (const key in credentialSubject) {
            const maskValues = mask === null || mask === void 0 ? void 0 : mask[key];
            if (maskValues) {
                const maskedKey = functions_1.default.blind(key, holderPublicKey);
                if (
                    credentialSubject === null || credentialSubject === void 0
                        ? void 0
                        : credentialSubject[key]
                ) {
                    try {
                        if (
                            lodash_1.default.isObject(
                                mask === null || mask === void 0 ? void 0 : mask[key]
                            ) &&
                            lodash_1.default.isObject(credentialSubject[key])
                        ) {
                            const result = createMask({
                                mask: mask === null || mask === void 0 ? void 0 : mask[key],
                                credentialSubject: credentialSubject[key],
                                holderPublicKey
                            });
                            maskedClaims[
                                (mask === null || mask === void 0 ? void 0 : mask[key]) === true
                                    ? maskedKey
                                    : key
                            ] = result === null || result === void 0 ? void 0 : result.maskedClaims;
                            if (
                                lodash_1.default.size(
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks
                                )
                            )
                                maskedMasks[maskedKey] =
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks;
                            continue;
                        }
                        maskedClaims[maskedKey] = functions_1.default.blind(
                            credentialSubject[key],
                            holderPublicKey
                        );
                        maskedMasks[maskedKey] = true;
                    } catch (error) {
                        throw Error(`Masking failed\n${error.message}`);
                    }
                }
            } else {
                maskedClaims[key] = credentialSubject[key];
            }
        }
        return {
            maskedClaims: functions_1.default.sortObject(maskedClaims),
            maskedMasks: functions_1.default.sortObject(maskedMasks)
        };
    }
};
/**
 * Generate selective masked claim set of a partially masked claim set in sorted order
 *
 * @param {Mask} mask - keys and values should be mask or a empty object.
 * @param {Claims} credentialSubject - partially masked credentialSubject.
 * @param {string} holderPublicKey - holder's Ethereum public key in hex.
 *
 * @return {Claims}  selective masked credentialSubject.
 */
const fullMask = ({ mask = {}, credentialSubject = {}, holderPublicKey }) => {
    if (lodash_1.default.isArray(credentialSubject)) {
        /* if the value is an array */
        const maskedClaims = [];
        const maskedMasks = {};
        for (let key = 0; key < credentialSubject.length; key++) {
            const maskValues =
                !(mask === null || mask === void 0 ? void 0 : mask[key]) ||
                lodash_1.default.isObject(mask === null || mask === void 0 ? void 0 : mask[key]);
            if (maskValues) {
                if (
                    credentialSubject === null || credentialSubject === void 0
                        ? void 0
                        : credentialSubject[key]
                ) {
                    try {
                        const maskedKey = functions_1.default.blind(
                            credentialSubject[key],
                            holderPublicKey
                        );
                        if (
                            lodash_1.default.isObject(
                                mask === null || mask === void 0 ? void 0 : mask[key]
                            ) &&
                            lodash_1.default.isObject(credentialSubject[key])
                        ) {
                            const result = fullMask({
                                mask: mask === null || mask === void 0 ? void 0 : mask[key],
                                credentialSubject: credentialSubject[key],
                                holderPublicKey
                            });
                            maskedClaims.push(
                                result === null || result === void 0 ? void 0 : result.maskedClaims
                            );
                            if (
                                lodash_1.default.size(
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks
                                )
                            )
                                maskedMasks[key] =
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks;
                            continue;
                        }
                        maskedClaims.push(maskedKey);
                        maskedMasks[key] = true;
                    } catch (error) {
                        throw Error(`Masking failed\n${error.message}`);
                    }
                }
            } else {
                maskedClaims.push(credentialSubject[key]);
            }
        }
        return {
            maskedClaims: functions_1.default.sortObject(maskedClaims),
            maskedMasks: functions_1.default.sortObject(maskedMasks)
        };
    } else if (lodash_1.default.isObject(credentialSubject)) {
        /* if the value is an object */
        const maskedClaims = {};
        const maskedMasks = {};
        for (const key in credentialSubject) {
            const maskValues =
                !(mask === null || mask === void 0 ? void 0 : mask[key]) ||
                lodash_1.default.isObject(mask === null || mask === void 0 ? void 0 : mask[key]);
            if (maskValues) {
                if (
                    credentialSubject === null || credentialSubject === void 0
                        ? void 0
                        : credentialSubject[key]
                ) {
                    const maskedKey = functions_1.default.blind(key, holderPublicKey);
                    try {
                        if (
                            lodash_1.default.isObject(
                                mask === null || mask === void 0 ? void 0 : mask[key]
                            ) &&
                            lodash_1.default.isObject(credentialSubject[key])
                        ) {
                            const result = fullMask({
                                mask: mask === null || mask === void 0 ? void 0 : mask[key],
                                credentialSubject: credentialSubject[key],
                                holderPublicKey
                            });
                            maskedClaims[maskedKey] =
                                result === null || result === void 0 ? void 0 : result.maskedClaims;
                            if (
                                lodash_1.default.size(
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks
                                )
                            )
                                maskedMasks[maskedKey] =
                                    result === null || result === void 0
                                        ? void 0
                                        : result.maskedMasks;
                            continue;
                        }
                        maskedClaims[maskedKey] = functions_1.default.blind(
                            credentialSubject[key],
                            holderPublicKey
                        );
                        maskedMasks[maskedKey] = true;
                    } catch (error) {
                        throw Error(`Masking failed\n${error.message}`);
                    }
                }
            } else {
                maskedClaims[key] = credentialSubject[key];
            }
        }
        return {
            maskedClaims: functions_1.default.sortObject(maskedClaims),
            maskedMasks: functions_1.default.sortObject(maskedMasks)
        };
    }
};
exports.default = { create: createMask, full: fullMask };

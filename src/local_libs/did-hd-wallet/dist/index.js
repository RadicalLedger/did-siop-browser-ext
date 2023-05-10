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
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: []
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === 'function' &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError('Generator is already executing.');
            while ((g && ((g = 0), op[0] && (_ = 0)), _))
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y['return']
                                    : op[0]
                                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateMnemonic =
    exports.generateMnemonic =
    exports.createVerificationMethod =
    exports.getSeedFromMnemonic =
    exports.Types =
        void 0;
var bip39_1 = require('bip39');
var bip32_1 = require('bip32');
var buffer_1 = require('buffer');
var base_58_1 = __importDefault(require('base-58'));
var ed25519_signature_2018_1 = require('@transmute/ed25519-signature-2018');
var Types;
(function (Types) {
    Types[(Types['SEED'] = 0)] = 'SEED';
    Types[(Types['MNEMONIC'] = 1)] = 'MNEMONIC';
    Types[(Types['WIF'] = 2)] = 'WIF';
    Types[(Types['BASE58'] = 3)] = 'BASE58';
})((Types = exports.Types || (exports.Types = {})));
var Wallet = /** @class */ (function () {
    function Wallet(type, value) {
        switch (type) {
            case Types.SEED: {
                try {
                    this.mnemonic = undefined;
                    this.masterNode = (0, bip32_1.fromSeed)(buffer_1.Buffer.from(value, 'hex'));
                    break;
                } catch (e) {
                    throw Error(e);
                }
            }
            case Types.MNEMONIC: {
                this.mnemonic = value;
                try {
                    var seed = getSeedFromMnemonic(value);
                    this.masterNode = (0, bip32_1.fromSeed)(buffer_1.Buffer.from(seed, 'hex'));
                } catch (e) {
                    throw Error(e);
                }
                break;
            }
            case Types.BASE58: {
                try {
                    this.mnemonic = undefined;
                    this.masterNode = (0, bip32_1.fromBase58)(value);
                } catch (e) {
                    throw Error(e);
                }
                break;
            }
            default: {
                throw Error('Invalid parameters');
            }
        }
    }
    Wallet.prototype.getMasterKeys = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var privateKey, verificationKey, publicKey, did;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        privateKey =
                            (_a = this.masterNode.privateKey) === null || _a === void 0
                                ? void 0
                                : _a.toString('hex');
                        return [4 /*yield*/, createVerificationMethod(privateKey)];
                    case 1:
                        verificationKey = _b.sent();
                        publicKey = buffer_1.Buffer.from(
                            base_58_1.default.decode(verificationKey.publicKeyBase58)
                        ).toString('hex');
                        did = verificationKey.id.split('#')[0];
                        return [
                            2 /*return*/,
                            {
                                privateKey: privateKey,
                                publicKey: publicKey,
                                did: did,
                                verificationKey: verificationKey
                            }
                        ];
                }
            });
        });
    };
    Wallet.prototype.getMasterPrivateKey = function () {
        var _a;
        return (_a = this.masterNode.privateKey) === null || _a === void 0
            ? void 0
            : _a.toString('hex');
    };
    Wallet.prototype.getMasterMnemonic = function () {
        return this.mnemonic;
    };
    Wallet.prototype.getChildKeys = function (path) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var childNode, privateKey, verificationKey, publicKey, did, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        childNode = this.masterNode.derivePath(path);
                        privateKey =
                            (_a = childNode.privateKey) === null || _a === void 0
                                ? void 0
                                : _a.toString('hex');
                        return [4 /*yield*/, createVerificationMethod(privateKey)];
                    case 1:
                        verificationKey = _b.sent();
                        publicKey = buffer_1.Buffer.from(
                            base_58_1.default.decode(verificationKey.publicKeyBase58)
                        ).toString('hex');
                        did = verificationKey.id.split('#')[0];
                        return [
                            2 /*return*/,
                            {
                                privateKey: privateKey,
                                publicKey: publicKey,
                                did: did,
                                verificationKey: verificationKey
                            }
                        ];
                    case 2:
                        e_1 = _b.sent();
                        throw Error(e_1);
                    case 3:
                        return [2 /*return*/];
                }
            });
        });
    };
    return Wallet;
})();
exports.default = Wallet;
function getSeedFromMnemonic(mnemonic) {
    if ((0, bip39_1.validateMnemonic)(mnemonic)) {
        try {
            var seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic).toString('hex');
            return seed;
        } catch (e) {
            throw Error(e);
        }
    } else {
        throw Error('Not a valid mnemonic');
    }
}
exports.getSeedFromMnemonic = getSeedFromMnemonic;
function createVerificationMethod(seed) {
    return __awaiter(this, void 0, void 0, function () {
        var k, jwk;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    return [
                        4 /*yield*/,
                        ed25519_signature_2018_1.Ed25519VerificationKey2018.generate({
                            secureRandom: function () {
                                return buffer_1.Buffer.from(seed, 'hex');
                            }
                        })
                    ];
                case 1:
                    k = _a.sent();
                    return [
                        4 /*yield*/,
                        k.export({
                            privateKey: true,
                            type: 'Ed25519VerificationKey2018'
                        })
                    ];
                case 2:
                    jwk = _a.sent();
                    return [2 /*return*/, jwk];
            }
        });
    });
}
exports.createVerificationMethod = createVerificationMethod;
var bip39_2 = require('bip39');
Object.defineProperty(exports, 'generateMnemonic', {
    enumerable: true,
    get: function () {
        return bip39_2.generateMnemonic;
    }
});
Object.defineProperty(exports, 'validateMnemonic', {
    enumerable: true,
    get: function () {
        return bip39_2.validateMnemonic;
    }
});

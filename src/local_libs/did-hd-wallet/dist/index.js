'use strict';
var _0x44c4 = [
    'getMasterMnemonic',
    'privateKeyToAccount',
    '8962UcBHyW',
    'get',
    '__esModule',
    'generateMnemonic',
    'createRandomETHDID',
    'validateMnemonic',
    '1061029buJXHz',
    'create',
    'mnemonic',
    'SEED',
    'did:ethr:',
    'fromBase58',
    'BASE58',
    'from',
    'address',
    'getWIF',
    'eth',
    'getMasterKeys',
    'MNEMONIC',
    'publicKeyToETH',
    '16IeHJjp',
    'getSeedFromMnemonic',
    'enumerable',
    'replace',
    '840119YJexjN',
    'fromSeed',
    'accounts',
    'createETHDIDFromPrivateKey',
    'toString',
    'wif',
    'default',
    '91781wfSemU',
    'chainCode',
    'toWIF',
    'WIF',
    'Invalid\x20parameters',
    'getMasterPublicKey',
    'masterNode',
    'Types',
    'publicKey',
    'prototype',
    'ethAddress',
    'getBase58',
    'hex',
    'getMasterChainCode',
    '734910VPpvvg',
    'getMasterPrivateKey',
    'getChildKeys',
    'defineProperty',
    'toBase58',
    '197312KKWiDf',
    'base58',
    'privateKey',
    'getDID',
    '4826PdpDyq',
    'did'
];
var _0x34a7 = function (_0x2786b0, _0x9cc66a) {
    _0x2786b0 = _0x2786b0 - 0x193;
    var _0x44c435 = _0x44c4[_0x2786b0];
    return _0x44c435;
};
var _0x3069e0 = _0x34a7;
(function (_0x37ae52, _0x542fe2) {
    var _0x20ba48 = _0x34a7;
    while (!![]) {
        try {
            var _0x1764c7 =
                parseInt(_0x20ba48(0x193)) +
                parseInt(_0x20ba48(0x1b6)) +
                parseInt(_0x20ba48(0x1af)) +
                -parseInt(_0x20ba48(0x19d)) +
                -parseInt(_0x20ba48(0x197)) * -parseInt(_0x20ba48(0x1ab)) +
                -parseInt(_0x20ba48(0x1c9)) +
                parseInt(_0x20ba48(0x1c4));
            if (_0x1764c7 === _0x542fe2) break;
            else _0x37ae52['push'](_0x37ae52['shift']());
        } catch (_0x8b534f) {
            _0x37ae52['push'](_0x37ae52['shift']());
        }
    }
})(_0x44c4, 0x87e8f);
var __importDefault =
        (this && this['__importDefault']) ||
        function (_0xa78559) {
            var _0x59d3d6 = _0x34a7;
            return _0xa78559 && _0xa78559[_0x59d3d6(0x199)] ? _0xa78559 : { default: _0xa78559 };
        },
    _0x540081 = {};
(_0x540081['value'] = !![]),
    Object[_0x3069e0(0x1c7)](exports, '__esModule', _0x540081),
    (exports['validateMnemonic'] =
        exports[_0x3069e0(0x19a)] =
        exports['createETHDIDFromPrivateKey'] =
        exports[_0x3069e0(0x19b)] =
        exports[_0x3069e0(0x1cc)] =
        exports[_0x3069e0(0x1aa)] =
        exports[_0x3069e0(0x1ac)] =
        exports['Types'] =
            void 0x0);
var bip39_1 = require('bip39'),
    bip32_1 = require('bip32'),
    ethereum_public_key_to_address_1 = __importDefault(require('ethereum-public-key-to-address')),
    ethr_did_1 = __importDefault(require('ethr-did')),
    web3_1 = __importDefault(require('web3')),
    Types;
(function (_0x485506) {
    var _0x431687 = _0x3069e0;
    (_0x485506[(_0x485506[_0x431687(0x1a0)] = 0x0)] = _0x431687(0x1a0)),
        (_0x485506[(_0x485506[_0x431687(0x1a9)] = 0x1)] = _0x431687(0x1a9)),
        (_0x485506[(_0x485506[_0x431687(0x1b9)] = 0x2)] = _0x431687(0x1b9)),
        (_0x485506[(_0x485506[_0x431687(0x1a3)] = 0x3)] = _0x431687(0x1a3));
})((Types = exports[_0x3069e0(0x1bd)] || (exports[_0x3069e0(0x1bd)] = {})));
var w3 = new web3_1[_0x3069e0(0x1b5)](),
    Wallet = (function () {
        var _0x39b50a = _0x3069e0;
        function _0x1324a6(_0x5e72b6, _0xb99e23) {
            var _0x339c1a = _0x34a7;
            switch (_0x5e72b6) {
                case Types['SEED']: {
                    try {
                        (this[_0x339c1a(0x19f)] = undefined),
                            (this[_0x339c1a(0x1bc)] = bip32_1[_0x339c1a(0x1b0)](
                                Buffer[_0x339c1a(0x1a4)](_0xb99e23, 'hex')
                            ));
                        break;
                    } catch (_0x70fed8) {
                        throw Error(_0x70fed8);
                    }
                }
                case Types[_0x339c1a(0x1a9)]: {
                    this[_0x339c1a(0x19f)] = _0xb99e23;
                    try {
                        var _0x2a1453 = getSeedFromMnemonic(_0xb99e23);
                        this[_0x339c1a(0x1bc)] = bip32_1[_0x339c1a(0x1b0)](
                            Buffer[_0x339c1a(0x1a4)](_0x2a1453, 'hex')
                        );
                    } catch (_0x2845ae) {
                        throw Error(_0x2845ae);
                    }
                    break;
                }
                case Types['BASE58']: {
                    try {
                        (this[_0x339c1a(0x19f)] = undefined),
                            (this[_0x339c1a(0x1bc)] = bip32_1[_0x339c1a(0x1a2)](_0xb99e23));
                    } catch (_0x19a644) {
                        throw Error(_0x19a644);
                    }
                    break;
                }
                default: {
                    throw Error(_0x339c1a(0x1ba));
                }
            }
        }
        return (
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1a8)] = function () {
                var _0x2813cb = _0x39b50a,
                    _0x5c8290,
                    _0x1d1456 =
                        (_0x5c8290 = this['masterNode'][_0x2813cb(0x1cb)]) === null ||
                        _0x5c8290 === void 0x0
                            ? void 0x0
                            : _0x5c8290[_0x2813cb(0x1b3)](_0x2813cb(0x1c2)),
                    _0x47eee4 = this[_0x2813cb(0x1bc)][_0x2813cb(0x1b7)][_0x2813cb(0x1b3)](
                        _0x2813cb(0x1c2)
                    ),
                    _0x3e8434 = this['masterNode'][_0x2813cb(0x1be)][_0x2813cb(0x1b3)]('hex'),
                    _0x45bc4a = this['masterNode'][_0x2813cb(0x1c8)](),
                    _0x2793c5 = this[_0x2813cb(0x1bc)][_0x2813cb(0x1b8)](),
                    _0x3d7433 = publicKeyToETH(_0x3e8434),
                    _0x480667 = getDID(_0x3d7433),
                    _0x28222a = {};
                return (
                    (_0x28222a[_0x2813cb(0x1cb)] = _0x1d1456),
                    (_0x28222a[_0x2813cb(0x1be)] = _0x3e8434),
                    (_0x28222a[_0x2813cb(0x1b7)] = _0x47eee4),
                    (_0x28222a[_0x2813cb(0x1ca)] = _0x45bc4a),
                    (_0x28222a[_0x2813cb(0x1b4)] = _0x2793c5),
                    (_0x28222a[_0x2813cb(0x1c0)] = _0x3d7433),
                    (_0x28222a[_0x2813cb(0x194)] = _0x480667),
                    _0x28222a
                );
            }),
            (_0x1324a6['prototype'][_0x39b50a(0x1c5)] = function () {
                var _0x30c35b = _0x39b50a,
                    _0x201e89;
                return (_0x201e89 = this[_0x30c35b(0x1bc)][_0x30c35b(0x1cb)]) === null ||
                    _0x201e89 === void 0x0
                    ? void 0x0
                    : _0x201e89[_0x30c35b(0x1b3)](_0x30c35b(0x1c2));
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1bb)] = function () {
                var _0xd1ac3c = _0x39b50a;
                return this['masterNode'][_0xd1ac3c(0x1be)][_0xd1ac3c(0x1b3)](_0xd1ac3c(0x1c2));
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1c3)] = function () {
                var _0x3a785e = _0x39b50a;
                return this[_0x3a785e(0x1bc)][_0x3a785e(0x1b7)][_0x3a785e(0x1b3)](_0x3a785e(0x1c2));
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x195)] = function () {
                return this['mnemonic'];
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1c6)] = function (_0x7d93fa) {
                var _0x1a1711 = _0x39b50a,
                    _0x4de826;
                try {
                    var _0x91d0c2 = this[_0x1a1711(0x1bc)]['derivePath'](_0x7d93fa),
                        _0x31e90b =
                            (_0x4de826 = _0x91d0c2[_0x1a1711(0x1cb)]) === null ||
                            _0x4de826 === void 0x0
                                ? void 0x0
                                : _0x4de826['toString'](_0x1a1711(0x1c2)),
                        _0x36916b = _0x91d0c2[_0x1a1711(0x1b7)][_0x1a1711(0x1b3)](_0x1a1711(0x1c2)),
                        _0x2b8657 = _0x91d0c2['publicKey'][_0x1a1711(0x1b3)](_0x1a1711(0x1c2)),
                        _0x1f084b = _0x91d0c2[_0x1a1711(0x1c8)](),
                        _0x2fbbaf = _0x91d0c2[_0x1a1711(0x1b8)](),
                        _0x1b3644 = publicKeyToETH(_0x2b8657),
                        _0x11d0aa = getDID(_0x1b3644),
                        _0x42284d = {};
                    return (
                        (_0x42284d[_0x1a1711(0x1cb)] = _0x31e90b),
                        (_0x42284d['publicKey'] = _0x2b8657),
                        (_0x42284d[_0x1a1711(0x1b7)] = _0x36916b),
                        (_0x42284d[_0x1a1711(0x1ca)] = _0x1f084b),
                        (_0x42284d[_0x1a1711(0x1b4)] = _0x2fbbaf),
                        (_0x42284d[_0x1a1711(0x1c0)] = _0x1b3644),
                        (_0x42284d[_0x1a1711(0x194)] = _0x11d0aa),
                        _0x42284d
                    );
                } catch (_0x4a8a16) {
                    throw Error(_0x4a8a16);
                }
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1c1)] = function () {
                var _0x116d16 = _0x39b50a;
                return this[_0x116d16(0x1bc)]['toBase58']();
            }),
            (_0x1324a6[_0x39b50a(0x1bf)][_0x39b50a(0x1a6)] = function () {
                var _0x3eb6bd = _0x39b50a;
                return this[_0x3eb6bd(0x1bc)]['toWIF']();
            }),
            _0x1324a6
        );
    })();
exports[_0x3069e0(0x1b5)] = Wallet;
function getSeedFromMnemonic(_0x5208bb) {
    var _0x18e5ea = _0x3069e0;
    if (bip39_1[_0x18e5ea(0x19c)](_0x5208bb))
        try {
            var _0x112701 = bip39_1['mnemonicToSeedSync'](_0x5208bb)[_0x18e5ea(0x1b3)](
                _0x18e5ea(0x1c2)
            );
            return _0x112701;
        } catch (_0x49d483) {
            throw Error(_0x49d483);
        }
    else throw Error('Not\x20a\x20valid\x20mnemonic');
}
exports[_0x3069e0(0x1ac)] = getSeedFromMnemonic;
function publicKeyToETH(_0x467380) {
    var _0x3d2594 = _0x3069e0,
        _0x45c5d3 = ethereum_public_key_to_address_1[_0x3d2594(0x1b5)](_0x467380);
    return _0x45c5d3;
}
exports[_0x3069e0(0x1aa)] = publicKeyToETH;
function getDID(_0xc57120) {
    var _0x21f407 = _0x3069e0;
    return _0x21f407(0x1a1) + _0xc57120;
}
exports[_0x3069e0(0x1cc)] = getDID;
function createRandomETHDID() {
    var _0x53170a = _0x3069e0,
        _0x3a1b62 = w3[_0x53170a(0x1a7)][_0x53170a(0x1b1)][_0x53170a(0x19e)](),
        _0x47084f = {};
    (_0x47084f[_0x53170a(0x1a5)] = _0x3a1b62['address']),
        (_0x47084f[_0x53170a(0x1cb)] = _0x3a1b62[_0x53170a(0x1cb)]);
    var _0xe51481 = new ethr_did_1[_0x53170a(0x1b5)](_0x47084f),
        _0x55d372 = {};
    return (
        (_0x55d372[_0x53170a(0x1cb)] = _0x3a1b62[_0x53170a(0x1cb)][_0x53170a(0x1ae)]('0x', '')),
        (_0x55d372[_0x53170a(0x194)] = _0xe51481['did']),
        _0x55d372
    );
}
exports['createRandomETHDID'] = createRandomETHDID;
function createETHDIDFromPrivateKey(_0xf01c43) {
    var _0x191b3d = _0x3069e0,
        _0x3e862b = w3[_0x191b3d(0x1a7)][_0x191b3d(0x1b1)][_0x191b3d(0x196)](_0xf01c43),
        _0x1e633c = {};
    (_0x1e633c['address'] = _0x3e862b[_0x191b3d(0x1a5)]),
        (_0x1e633c['privateKey'] = _0x3e862b[_0x191b3d(0x1cb)]);
    var _0x48d555 = new ethr_did_1[_0x191b3d(0x1b5)](_0x1e633c),
        _0x6c93e5 = {};
    return (
        (_0x6c93e5[_0x191b3d(0x1cb)] = _0x3e862b[_0x191b3d(0x1cb)][_0x191b3d(0x1ae)]('0x', '')),
        (_0x6c93e5[_0x191b3d(0x194)] = _0x48d555[_0x191b3d(0x194)]),
        _0x6c93e5
    );
}
exports[_0x3069e0(0x1b2)] = createETHDIDFromPrivateKey;
var bip39_2 = require('bip39'),
    _0x4f3919 = {};
(_0x4f3919[_0x3069e0(0x1ad)] = !![]),
    (_0x4f3919[_0x3069e0(0x198)] = function () {
        var _0x430625 = _0x3069e0;
        return bip39_2[_0x430625(0x19a)];
    }),
    Object[_0x3069e0(0x1c7)](exports, _0x3069e0(0x19a), _0x4f3919);
var _0x5199c5 = {};
(_0x5199c5[_0x3069e0(0x1ad)] = !![]),
    (_0x5199c5['get'] = function () {
        var _0x378a1d = _0x3069e0;
        return bip39_2[_0x378a1d(0x19c)];
    }),
    Object[_0x3069e0(0x1c7)](exports, _0x3069e0(0x19c), _0x5199c5);

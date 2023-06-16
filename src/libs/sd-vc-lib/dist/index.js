'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.functions = exports.utils = exports.verifiable = void 0;
const verifiable_1 = __importDefault(require('./verifiable'));
exports.verifiable = verifiable_1.default;
const utils_1 = __importDefault(require('./utils'));
exports.utils = utils_1.default;
const functions_1 = __importDefault(require('./functions'));
exports.functions = functions_1.default;
const VCSD = {
    verifiable: verifiable_1.default,
    utils: utils_1.default,
    functions: functions_1.default
};
exports.default = VCSD;

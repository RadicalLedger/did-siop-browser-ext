'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const credential_1 = __importDefault(require('./credential'));
const presentation_1 = __importDefault(require('./presentation'));
exports.default = {
    credential: credential_1.default,
    presentation: presentation_1.default
};

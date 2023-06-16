import { GenerateSignatureProps, VerifySignatureProps } from '../types/utils.type';
declare const _default: {
    generate: ({ data, privateKey }: GenerateSignatureProps) => string;
    verify: ({ data, signature, publicKey }: VerifySignatureProps) => any;
};
export default _default;

import { Resolver } from 'did-resolver';
import { ethers } from 'ethers';
import { getResolver, REGISTRY } from 'moon-did-resolver';
import configs from 'src/configs';
import { CHAIN_NAME } from './on-chain-enum';

export class CustomDidResolver {
    private url: string;
    private onChainResolver?: Resolver;

    constructor(didMethod: string, chain?: CHAIN_NAME.MAINNET | CHAIN_NAME.ALPHA) {
        this.url = `${configs.env.offchain}${didMethod}/did/`;
        if (chain) {
            const provider =
                chain === CHAIN_NAME.MAINNET
                    ? new ethers.JsonRpcProvider(configs.env.mainnet_rpc_provider)
                    : new ethers.JsonRpcProvider(configs.env.alpha_rpc_provider);
            this.onChainResolver = new Resolver(
                getResolver({
                    name: chain,
                    provider,
                    registry: chain === CHAIN_NAME.MAINNET ? REGISTRY : configs.env.alpha_registry
                })
            );
        }
    }
    async resolveDidDocument(did: string) {
        var result;

        try {
            if (did.split(':')[1] !== 'key') {
                const res = await Promise.race([
                    this.onChainResolver?.resolve(did),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);

                if (res) {
                    result = res;
                } else {
                    result = await fetch(this.url + did, {
                        headers: {
                            Accept: 'application/json',
                            'Accept-Encoding': 'identity'
                        }
                    });
                    result = await result.json();
                }
            }
            result = await fetch(this.url + did, {
                headers: {
                    Accept: 'application/json',
                    'Accept-Encoding': 'identity'
                }
            });

            result = await result.json();
        } catch (error) {
            result = await fetch(this.url + did);
            result = await result.json();
        }

        return result?.didDocument;
    }

    /**
     *
     * @param {string} did - DID to resolve the DID Document for.
     * @returns A promise which resolves to a {DidDocument}
     * @override resolve(did) method of the {DidResolver}
     * @remarks Unlike other resolvers this class can resolve Documents for many DID Methods.
     * Therefore the check in the parent class needs to be overridden.
     */
    resolve(did: string) {
        return this.resolveDidDocument(did);
    }
}

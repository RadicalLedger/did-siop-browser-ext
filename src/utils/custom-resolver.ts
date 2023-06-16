import configs from 'src/configs';

export class CustomDidResolver {
    async resolveDidDocument(did: string) {
        var result;
        let url = `${configs.env.offchain}/${did}`;

        try {
            result = await fetch(url, {
                headers: {
                    Accept: 'application/json',
                    'Accept-Encoding': 'identity'
                }
            });

            result = await result.json();
        } catch (error) {
            result = await fetch(url);
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

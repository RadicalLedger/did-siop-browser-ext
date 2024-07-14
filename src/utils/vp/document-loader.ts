import configs from 'src/configs';

const documentLoader = async (iri: string): Promise<any> => {
    let doc: any;
    let url = iri.split('#')[0];

    if (url.startsWith('did:')) {
        let didMethod = iri.split(':')[1];

        url = `${configs.env.offchain}/${didMethod}/did/${url}`;

        doc = await fetchDoc(url);
        doc = doc?.didDocument;
    } else {
        doc = await fetchDoc(url);
    }

    if (doc) {
        // console.log('document ==>> ', JSON.stringify(doc, null, 4));
        return { document: doc, documentUrl: url };
    }
    throw new Error(`iri ${iri} not supported`);
};

const fetchDoc = (url: string) => {
    return new Promise(async (resolve) => {
        var result: any;

        try {
            result = await fetch(url, {
                headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' }
            });
            result = await result.json();
        } catch (error) {
            result = await fetch(url);
            result = await result.json();
        }

        if (!result) return resolve(null);

        return resolve(result);
    });
};

export default documentLoader;

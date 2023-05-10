import axios from 'axios';
import config from './config';

const documentLoader = async (iri: string): Promise<any> => {
    let doc: any;
    let url = iri.split('#')[0];

    if (url.startsWith('did:')) {
        url = `${config.zedeid_url}${url}`;

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
            result = await axios.get(url, {
                headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' }
            });
        } catch (error) {
            result = await axios.get(url);
        }

        if (result?.status !== 200) return resolve(null);

        return resolve(result?.data);
    });
};

export default documentLoader;

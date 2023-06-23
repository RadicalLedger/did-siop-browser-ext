// @ts-ignore
import VCSD from 'sd-vc-lib';
import documentLoader from './document-loader';
import config from 'src/configs';

const createVP = ({ did, vcs, private_key }: { did: string; vcs: any[]; private_key: string }) => {
    return new Promise(async (resolve) => {
        const challenge = 'fcc8b78e-ecca-426a-a69f-8e7c927b845f';

        let zedeid_doc: any = await fetch(`${config.env.offchain}/${did}`);
        zedeid_doc = await zedeid_doc.json();

        if (!zedeid_doc?.didDocument) {
            console.error('zedeid document not found');
            resolve({ error: 'zedeid document not found' });
            return;
        }

        const vp = await VCSD.verifiable.presentation.create({
            holderPrivateKey: private_key,
            verifiableCredential: vcs,
            documentLoader
        });

        if (vp) {
            return resolve(vp);
        }

        return resolve({ error: 'failed to create the verifiable presentation' });
    });
};

export default createVP;

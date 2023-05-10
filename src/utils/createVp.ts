import VCSD from 'sd-vc-lib';
import axios from 'axios';
import documentLoader from './document-loader';

const view_app_domains: any = {
    localhost: 'localhost',
    'www.dev.mrwalletapp.zedeid.com': 'www.dev.mrview.zedeid.com',
    'www.stg.mrwalletapp.zedeid.com': 'www.stg.mrview.zedeid.com',
    'www.mrwalletapp.zedeid.com': 'www.mrview.zedeid.com'
};

const createVP = ({ did, vcs, private_key }: { did: string; vcs: any[]; private_key: string }) => {
    return new Promise(async (resolve) => {
        const challenge = 'fcc8b78e-ecca-426a-a69f-8e7c927b845f';
        const domain = view_app_domains[window.location.hostname];

        const zedeid_doc: any = await axios({
            method: 'GET',
            url: `${process.env.REACT_APP_RESOLVER}${did}`
        });

        if (!zedeid_doc?.data?.didDocument) {
            console.error('zedeid document not found');
            resolve({ error: 'zedeid document not found' });
            return;
        }

        const vp = await VCSD.verifiable.presentation.create({
            holderPrivateKey: private_key,
            verifiableCredential: vcs,
            documentLoader,
            domain,
            challenge
        });

        if (vp) {
            return resolve(vp);
        }

        return resolve({ error: 'failed to create the verifiable presentation' });
    });
};

export default createVP;

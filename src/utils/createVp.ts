import {
    Ed25519VerificationKey2018,
    Ed25519Signature2018
} from '@transmute/ed25519-signature-2018';
import { verifiable } from '@transmute/vc.js';
import axios from 'axios';
import documentLoader from './documentLoader';
// @ts-ignore
import { binary_to_base58 } from 'base58-js';
import config from './config';

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
            url: `${config.zedeid_url}did/${did}`
        });

        if (!zedeid_doc?.data?.didDocument) {
            console.error('zedeid document not found');
            resolve({ error: 'zedeid document not found' });
            return;
        }

        let privateKeyBase58 = binary_to_base58(Buffer.from(private_key));
        let verificationMethod = {
            ...zedeid_doc?.data?.didDocument?.verificationMethod?.[0],
            privateKeyBase58
        };

        const keyPairIssuer = await Ed25519VerificationKey2018.from(verificationMethod);

        const suite = new Ed25519Signature2018({
            key: keyPairIssuer,
            date: new Date().toISOString()
        });

        const presentation = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
            verifiableCredential: vcs,
            holder: did
        };

        const vp = await verifiable.presentation.create({
            presentation,
            format: ['vp'],
            documentLoader: documentLoader,
            challenge,
            domain,
            suite
        });

        if (vp?.items?.length > 0) {
            return resolve(vp);
        }

        return resolve({ error: 'failed to create the verifiable presentation' });
    });
};

export default createVP;

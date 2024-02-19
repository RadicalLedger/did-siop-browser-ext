import { TASKS } from 'src/utils/tasks';
import utils from 'src/utils';
import { checkSigning, getStorage, getProvider, sendContext } from 'src/core/helpers';
import { resolveSigningKey, setDID, setSingingKey } from '../helpers/did';
import { STORAGE_KEYS } from 'src/utils/storage';
import { Request } from '../../types/core';
import configs from 'src/configs';
import jwt from 'jsonwebtoken';
import VCSD from 'sd-vc-lib';
import Wallet, { Types, generateMnemonic } from 'did-hd-wallet';
import { CONTEXT_TASKS } from 'src/utils/context';
import { storage, tabs } from '../runtime';
import queryString from 'query-string';
import { removeRequest } from '../helpers/requests';
import createVP from 'src/utils/vp';

/* tasks */
export default {
    [TASKS.AUTHENTICATE]: ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.password], function (result) {
                let storedHash = result[STORAGE_KEYS.password];

                response({ result: storedHash != undefined });
            });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.CHECK_LOGIN]: ({ request, data }: Request, response) => {
        try {
            if (data?.loggedInState) return response({ result: true });

            return response({ result: false });
        } catch (error) {
            response({ result: false, error: error?.message });
        }
    },
    [TASKS.LOGIN]: ({ request, data }: Request, response) => {
        try {
            let password = request.password;

            storage.get([STORAGE_KEYS.salt], function (result) {
                let salt = result[STORAGE_KEYS.salt] || '';
                let hashed = utils.hash(password, salt);

                storage.get([STORAGE_KEYS.password], function (result) {
                    let storedHash = result[STORAGE_KEYS.password] || '';

                    if (hashed === storedHash) {
                        response({
                            result: true,
                            set: {
                                loggedInState: password
                            }
                        });
                    } else {
                        response({ result: false });
                        //storage.set({ [STORAGE_KEYS.loginState]: undefined });
                    }
                });
            });
        } catch (err) {
            response({ result: false });
            //storage.set({ [STORAGE_KEYS.loginState]: undefined });
        }
    },
    [TASKS.REGISTER]: ({ request, data }: Request, response) => {
        try {
            let password = request.password;
            let salt = utils.randomString(32);
            let hashed = utils.hash(password, salt);

            storage.set({ [STORAGE_KEYS.password]: hashed });
            storage.set({ [STORAGE_KEYS.salt]: salt });

            response({ result: true });
        } catch (err) {
            response({ result: false });
        }
    },
    [TASKS.GET_IDENTITY]: async ({ request, data }: Request, response) => {
        try {
            let did;
            let keys;

            let profile = await getStorage(STORAGE_KEYS.profile);
            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

            if (encryptedDID) did = utils.decrypt(encryptedDID, data.loggedInState);
            if (encryptedSigningInfo)
                keys = JSON.parse(utils.decrypt(encryptedSigningInfo, data.loggedInState));

            response({
                result: {
                    did,
                    keys,
                    profile
                },
                set: {
                    signingInfoSet: keys
                }
            });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.UPDATE_IDENTITY]: async ({ request, data }: Request, response) => {
        try {
            let profile: any = (await getStorage(STORAGE_KEYS.profile)) || {};

            for (const key in request.data) {
                profile[key] = request.data[key];
            }

            storage.set({ [STORAGE_KEYS.profile]: profile });

            response({ result: profile });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.CHANGE_DID]: async ({ request, data }: Request, response) => {
        try {
            data.provider = await getProvider(request.did);

            /* store did */
            await setDID({ request: { did: request.did }, data });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: { signingInfoSet: [], provider: data.provider } });
        } catch (error) {
            console.log({ error });
            response({ error: error?.message });
        }
    },
    [TASKS.CREATE_DID]: async ({ request, data }: Request, response) => {
        try {
            const resolver_url = configs.env.offchain;
            const mnemonic = generateMnemonic(128);

            const wallet = new Wallet(Types.MNEMONIC, mnemonic);
            const ed = new VCSD.utils.ed25519();

            const {
                publicKey: holderPublicKey,
                privateKey: holderPrivateKey,
                did: holderDID,
                verificationKey: holderVerificationKey
            }: any = await wallet.getChildKeys('m/256/256/2');

            let holderChallengeResponse: any = await fetch(`${resolver_url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ did: holderDID })
            });
            holderChallengeResponse = await holderChallengeResponse.json();

            const { challenge: holderChallenge } = jwt.decode(
                holderChallengeResponse.challengeToken
            ) as any;

            let holderResponse: any = await fetch(`${resolver_url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    did: holderDID,
                    verificationKey: holderVerificationKey,
                    challengeResponse: {
                        publicKey: holderPublicKey,
                        cipherText: ed
                            .sign(
                                Buffer.from(holderChallenge, 'hex'),
                                Buffer.from(holderPrivateKey as string, 'hex')
                            )
                            .toHex(),
                        jwt: holderChallengeResponse.challengeToken
                    }
                })
            });
            holderResponse = await holderResponse.json();

            if (holderResponse?.status !== 'success') {
                return response({ error: 'Holder DID document creation failed' });
            }

            /* set did */
            setDID({ request: { did: holderDID }, data });

            /* const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            ); */
            data.provider = await getProvider(holderDID);
            data.signingInfoSet = [];

            /* set new singing key */
            await setSingingKey({
                request: {
                    currentDID: holderDID,
                    keyString: mnemonic,
                    type: 'mnemonic'
                },
                data
            });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: data });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.ADD_KEY]: async ({ request, data }: Request, response) => {
        try {
            if (request.didAddress) {
                data.provider = await getProvider(request.didAddress);
                await setDID({ request: { did: request.didAddress }, data });
            }

            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );
            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let currentDID = utils.decrypt(encryptedDID, data.loggedInState);

            const kid = await setSingingKey({
                request: {
                    currentDID,
                    keyString: request.keyString,
                    type: request.type,
                    didAddress: request.didAddress,
                    didPath: request.didPath
                },
                data
            });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: kid, set: data });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.REMOVE_KEY]: async ({ request, data }: Request, response) => {
        try {
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );

            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            /* remove kid from provider and singing keys */
            data.provider.removeSigningParams(request.kid);
            data.signingInfoSet = data.signingInfoSet.filter((key) => {
                return key.kid !== request.kid;
            });

            /* store the new key set */
            let encryptedSigningInfo = utils.encrypt(
                JSON.stringify(data.signingInfoSet),
                data.loggedInState
            );
            storage.set({ [STORAGE_KEYS.signingInfoSet]: encryptedSigningInfo });

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: data });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.RESOLVE_KEY]: async ({ request, data }: Request, response) => {
        try {
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );
            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            const did = await resolveSigningKey({
                request: {
                    keyString: request.keyString,
                    type: request.type,
                    didPath: request.didPath
                },
                data
            });

            response({ result: did, set: data });
        } catch (error) {
            response({ error: error?.message });
        }
    },
    [TASKS.CHANGE_PASSWORD]: async ({ request, data }: Request, response) => {
        try {
            let password = request.password;
            let salt = utils.randomString(32);
            let hashed = utils.hash(password, salt);

            /* update new password and store */
            storage.set({ [STORAGE_KEYS.password]: hashed });
            storage.set({ [STORAGE_KEYS.salt]: salt });

            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let encryptedSigningInfo: any = await getStorage(STORAGE_KEYS.signingInfoSet);

            /* re encrypt did key and store */
            if (encryptedDID) {
                let didReEncrypted = utils.encrypt(
                    utils.decrypt(encryptedDID, request.currentPassword),
                    request.password
                );
                storage.set({ [STORAGE_KEYS.userDID]: didReEncrypted });
            }

            /* re encrypt singing keys and store */
            if (encryptedSigningInfo) {
                let keysReEncrypted = utils.encrypt(
                    utils.decrypt(encryptedSigningInfo, request.currentPassword),
                    request.password
                );
                storage.set({ [STORAGE_KEYS.signingInfoSet]: keysReEncrypted });
            }

            data.loggedInState = request.password;

            /* update local message to indicate there's new content */
            sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });

            response({ result: true, set: { loggedInState: data.loggedInState } });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.GET_REQUESTS]: async ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.requests], (result) => {
                let requests = result[STORAGE_KEYS.requests] || [];

                response({
                    result: requests,
                    badge: {
                        text: requests.length
                    }
                });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.PROCESS_REQUEST]: async ({ request, data }: Request, response) => {
        /* send the response */
        const sendResponse = async (response_mode, redirect_uri, result) => {
            try {
                switch (response_mode) {
                    case 'post':
                        await fetch(redirect_uri, {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ token: result })
                        });
                        break;

                    case 'get':
                        let get_url = new URL(redirect_uri);
                        get_url.search = new URLSearchParams({ token: result }).toString();

                        await fetch(get_url);
                        break;

                    case 'tab-url':
                        let tab_url = new URL(redirect_uri);
                        tab_url.search = new URLSearchParams({
                            code: result as string
                        }).toString();

                        tabs.query({ active: true, currentWindow: true }, function (_tabs) {
                            var tab = _tabs[0];
                            tabs.update(tab.id, { url: tab_url.href });
                        });
                        // sendContext({ request: { task: CONTEXT_TASKS.OPEN_TAB, url: tab_url } });
                        break;
                    case 'new-tab-url':
                        tabs.create({ url: tab_url.href });
                        // sendContext({ request: { task: CONTEXT_TASKS.OPEN_TAB, url: tab_url } });
                        break;
                }

                return true;
            } catch (error) {
                return { error };
            }
        };

        try {
            const requests: any = (await getStorage(STORAGE_KEYS.requests)) || [];
            const selectedRequest = requests.find((_) => _.index == request.index);

            const parsedQuery: any = queryString.parseUrl(selectedRequest.request);

            if (parsedQuery.url != 'openid://') return response({ error: 'Invalid request' });

            /* check signing */
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );

            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            let decoded = await data.provider.validateRequest(selectedRequest.request);

            if (!request.confirmed) {
                let uri: any = parsedQuery.query.redirect_uri || decoded?.payload?.redirect_uri;

                if (uri) {
                    /* send response */
                    await sendResponse(
                        decoded?.payload?.response_mode,
                        uri,
                        data.provider.generateErrorResponse('Access denied') as string
                    );
                }

                /* remove request */
                await removeRequest(request.index);

                return response({ result: true });
            }

            /* add id_token to payload claims */
            if (request.id_token) decoded.payload.claims['id_token'] = request.id_token;

            let response_result = {};
            if (request.vp_data?.vp_token && request.vp_data?._vp_token) {
                response_result = await data.provider.generateResponseWithVPData(
                    decoded.payload,
                    5000,
                    request.vp_data
                );
            } else {
                response_result = await data.provider.generateResponse(decoded.payload, 5000);
            }

            try {
                /* send response */
                const sendResult: any = await sendResponse(
                    decoded?.payload?.response_mode,
                    decoded?.payload?.redirect_uri,
                    response_result
                );

                if (sendResult?.error) return response({ error: sendResult.error });

                /* remove request */
                await removeRequest(request.index);
                response({ result: response_result });
            } catch (error) {
                return response({ error: error?.message || 'Failed to send response result' });
            }
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.REMOVE_REQUEST]: async ({ request, data }: Request, response) => {
        try {
            await removeRequest(request.index);

            response({ result: true });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.GET_VCS]: async ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.vcs], function (result) {
                let vcs = result[STORAGE_KEYS.vcs] || [];

                response({ result: vcs });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.REMOVE_VC]: async ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.vcs], function (result) {
                let vcs = result[STORAGE_KEYS.vcs] || [];

                vcs = vcs.filter((sr) => {
                    return sr.index != request.index;
                });

                storage.set({ [STORAGE_KEYS.vcs]: vcs });

                response({ result: vcs });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.CREATE_VP]: async ({ request, data }: Request, response) => {
        try {
            /* check signing */
            const signInfo: any = await checkSigning(
                data.provider,
                data.loggedInState,
                data.signingInfoSet
            );

            if (signInfo?.provider) data.provider = signInfo.provider;
            if (signInfo?.signingInfoSet) data.signingInfoSet = signInfo.signingInfoSet;

            let private_key = data.signingInfoSet[0]?.key;

            let encryptedDID: any = await getStorage(STORAGE_KEYS.userDID);
            let currentDID = utils.decrypt(encryptedDID, data.loggedInState);

            const vp: any = await createVP({
                did: currentDID,
                private_key,
                vcs: request.vcs
            });

            if (vp.error) return response({ error: vp.error });

            storage.get([STORAGE_KEYS.vps], function (result) {
                let vps = result[STORAGE_KEYS.vps] || [];

                let index = 1;
                if (vps.length > 0) index = Math.max(...vps.map((o) => o.index)) + 1;

                vps.push({ index, title: request.title, vp });
                storage.set({ [STORAGE_KEYS.vps]: vps });

                response({ result: vp });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.GET_VPS]: async ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.vps], function (result) {
                let vps = result[STORAGE_KEYS.vps] || [];

                response({ result: vps });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.REMOVE_VP]: async ({ request, data }: Request, response) => {
        try {
            storage.get([STORAGE_KEYS.vps], function (result) {
                let vps = result[STORAGE_KEYS.vps] || [];

                vps = vps.filter((sr) => {
                    return sr.index != request.index;
                });

                storage.set({ [STORAGE_KEYS.vps]: vps });

                response({ result: vps });
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    },
    [TASKS.LOGOUT]: async ({ request, data }: Request, response) => {
        try {
            if (data.loggedInState) {
                /* update local message to indicate there's new content */
                sendContext({ request: { task: CONTEXT_TASKS.NEW_CONTENT } });
                return response({ result: true, set: { loggedInState: undefined } });
            }

            return response({ result: false });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    }
};

import { TASKS } from 'src/utils/tasks';
import { storage } from '../runtime';
import { STORAGE_KEYS } from 'src/utils/storage';
import { Request } from 'src/types/core';
import queryString from 'query-string';
import { getStorage } from '../helpers';
import { NOTIFICATIONS } from 'src/utils/notifications';

export default {
    [TASKS.MAKE_REQUEST]: async ({ request, data }: Request, response) => {
        try {
            const queryParsed: any = queryString.parseUrl(request.did_siop);
            if (queryParsed?.url != 'openid://') return response({ error: 'Invalid request' });

            const requests: any = (await getStorage(STORAGE_KEYS.requests)) || [];

            /* add request to the list */
            requests.push({
                index: requests.length + 1,
                client_id: queryParsed.query.client_id,
                request: request.did_siop
            });

            /* store the request */
            storage.set({ [STORAGE_KEYS.requests]: requests });

            response({
                result: true,
                badge: { text: requests.length },
                notification: {
                    id: NOTIFICATIONS.NEW_REQUEST,
                    options: {
                        title: 'New Request Available',
                        message: 'New request has been added to the extension',
                        iconUrl: 'assets/did_siop_favicon.png',
                        type: 'basic'
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response({ error: error?.message });
        }
    }
};

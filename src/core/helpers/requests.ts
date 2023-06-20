import { STORAGE_KEYS } from 'src/utils/storage';
import { storage } from '../runtime';

const removeRequest = (index: string | number) => {
    return new Promise((resolve, reject) => {
        storage.get([STORAGE_KEYS.requests], (result) => {
            let requests: any = result[STORAGE_KEYS.requests] || [];

            let request = requests.filter((sr) => {
                return sr.index == index;
            })[0];

            requests = requests.filter((sr) => {
                return sr.index != index;
            });

            storage.set({ [STORAGE_KEYS.requests]: requests });

            resolve({ request, requests });
        });
    });
};

export { removeRequest };

import { Response } from '../types/core';

import functions from './functions';
import tasks from './functions/tasks';

import { action, engine, runtime } from './runtime';

var DATA = {
    signingInfoSet: [],
    loggedInState: undefined,
    provider: undefined
};

const setVariables = (result = {}) => {
    for (const key in result) {
        DATA[key] = result[key];
    }
};

runtime.onMessage.addListener(function (request, sender, response) {
    const onResponse = (res: Response) => {
        if (res?.set) setVariables(res.set);

        if (res?.notification) {
            /* clear request notification */
            engine.notifications.clear(res.notification.id);

            setTimeout(() => {
                engine.notifications.create(
                    res.notification.id,
                    res.notification.options,
                    (id: string) => {
                        setTimeout(() => {
                            engine.notifications.clear(id);
                        }, 5000);
                    }
                );
            }, 500);
        }

        if (res?.badge) {
            action.setBadgeBackgroundColor({ color: '#24b6aa' });
            action.setBadgeText({ text: `${res.badge.text || 0}` });
        }

        return response(res.result, res.error);
    };

    if (!sender.tab) {
        functions[request.task]({ request, data: DATA }, onResponse);
    } else {
        tasks[request.task]({ request, data: DATA }, onResponse);
    }

    return true;
});

/* keep the background alive */
/* only on chrome runtime */
chrome.alarms.create({ periodInMinutes: 4.9 });
chrome.alarms.onAlarm.addListener(() => {
    // console.log('log for debug');
});

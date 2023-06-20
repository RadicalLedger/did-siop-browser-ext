import { Response } from '../types/core';

import functions from './functions';
import tasks from './functions/tasks';

import { runtime } from './runtime';

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

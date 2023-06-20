import { CONTEXT_TASKS } from 'src/utils/context';
import { runtime } from './runtime';
import { TASKS } from 'src/utils/tasks';

/* on runtime */
runtime.onMessage.addListener(function ({ request, data }, _sender, response) {
    switch (request.task) {
        case CONTEXT_TASKS.NEW_CONTENT:
            localStorage.setItem('new-content', 'true');
            response({ result: true });
            break;

        default:
            response({ result: true });
            break;
    }

    return true;
});

/* for initial run */
localStorage.setItem('new-content', 'true');

const scrapeSiopLoginButtons = () => {
    const btns = document.querySelectorAll('[data-did-siop]');

    for (let i = 0; i < btns.length; i++) {
        const btn = <HTMLButtonElement>btns[i];

        btn.dataset['active'] = 'true';
        btn.addEventListener('click', function () {
            let did_siop = this.getAttribute('data-did-siop');

            runtime.sendMessage(
                {
                    task: TASKS.MAKE_REQUEST,
                    did_siop
                },
                (result, error) => {
                    if (result) {
                        console.log('Request sent to DID-SIOP');
                    } else if (error) {
                        throw new Error('DID_SIOP_ERROR: ' + error);
                    }
                }
            );
        });
    }
};

const scrapeSiopAddVCButtons = () => {
    const btns = document.querySelectorAll('[data-did-siop-vc]');

    for (let i = 0; i < btns.length; i++) {
        const btn = <HTMLButtonElement>btns[i];

        btn.dataset['active'] = 'true';
        btn.addEventListener('click', function () {
            let vc = this.getAttribute('data-did-siop-vc');

            runtime.sendMessage(
                {
                    task: TASKS.ADD_VC,
                    vc
                },
                (result, error) => {
                    if (result) {
                        console.log('Added verifiable credential to the extension');
                    } else if (error) {
                        throw new Error('DID_SIOP_ERROR: ' + error);
                    }
                }
            );
        });
    }
};

const scrapeSiopSettingsButtons = () => {
    const btns = document.querySelectorAll('[data-did-siop-settings]');

    for (let i = 0; i < btns.length; i++) {
        const btn = <HTMLButtonElement>btns[i];

        btn.dataset['active'] = 'true';
        btn.addEventListener('click', function () {
            let did_siop = this.getAttribute('data-did-siop-settings');

            runtime.sendMessage(
                {
                    task: TASKS.SET_SETTINGS,
                    did_siop
                },
                (result, error) => {
                    if (result) {
                        console.log('Settings configured in extension');
                    } else if (error) {
                        throw new Error('DID_SIOP_ERROR: ' + error);
                    }
                }
            );
        });
    }
};

setInterval(() => {
    if (localStorage.getItem('new-content')) {
        scrapeSiopLoginButtons();
        scrapeSiopAddVCButtons();
        scrapeSiopSettingsButtons();

        localStorage.removeItem('new-content');
    }
}, 100);

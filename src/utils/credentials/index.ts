import badge from './badge';
import certificate from './certificate';
import other from './other';
import transcript from './transcript';

const types: any = {
    CERTIFICATE: certificate,
    BADGE: badge,
    TRANSCRIPT: transcript,
    OTHER: other
};

export default {
    get: (type: string, vc: any) => {
        const func = types[type]?.vc;

        if (!func) return {};

        return func(vc);
    }
};

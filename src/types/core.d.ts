export interface Request {
    request: any;
    data?: {
        loggedInState?: string | undefined;
        signingInfoSet?: any[];
        provider?: any;
    };
}

export interface Response {
    result?: any;
    error?: any;
    set?: {
        loggedInState?: string;
        signingInfoSet?: any[];
        provider?: any;
    };
    notification?: {
        id: string;
        options: {
            title: string;
            message: string;
            iconUrl: string;
            type: string;
        };
    };
    badge?: {
        text?: string;
    };
}

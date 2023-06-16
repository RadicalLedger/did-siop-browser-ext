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
        signingInfoSet?: any;
    };
}

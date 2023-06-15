export interface Request {
    request: any;
    data?: {
        loggedInState: string | undefined;
    };
}

export interface Response {
    result: any;
    set?: {
        loggedInState?: string;
        signingInfoSet?: any;
    };
}

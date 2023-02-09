export const STORAGE_KEYS = {
    salt: 'did_siop_authentication_salt',
    password: 'did_siop_authetication_string',
    userDID: 'did_siop_user_did',
    signingInfoSet: 'did_siop_singing_info_set',
    requests: 'did_siop_requests',
    crypto_suit: 'did_siop_crypto_suit',
    vcs: 'visual_credentials'
};

export const enum TASKS {
    CHANGE_DID,
    ADD_KEY,
    REMOVE_KEY,
    PROCESS_REQUEST,
    CHECK_LOGIN_STATE,
    LOGIN,
    LOGOUT,
    CHECK_EXT_AUTHENTICATION,
    INIT_EXT_AUTHENTICATION,
    CHANGE_EXT_AUTHENTICATION,
    GET_IDENTITY,
    GET_REQUESTS,
    MAKE_REQUEST,
    SET_SETTINGS,
    CREATE_DID,
    ADD_VC,
    GET_VCS
}

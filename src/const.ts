export const STORAGE_KEYS = {
    salt: 'did_siop_authentication_salt',
    password: 'did_siop_authetication_string',
    userDID: 'did_siop_user_did',
    signingInfoSet: 'did_siop_singing_info_set',
    requests: 'did_siop_requests',
    crypto_suit: 'did_siop_crypto_suit',
    vcs: 'visual_credentials',
    vps: 'visual_presentations',
    loginState: 'did_siop_login_state',
    profile: 'did_siop_profile'
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
    REMOVE_VC,
    GET_VCS,
    ADD_VP,
    REMOVE_VP,
    GET_VPS,
    GET_LOGIN_STATE,
    CHANGE_PROFILE_INFO
}

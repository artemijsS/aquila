const initialState = {
    userData: {}
}

const user = (state = initialState, action) => {
    switch (action.type) {
        case 'USER_LOGIN':
            return {
                ...state,
                userData: action.payload
            }
        case 'USER_LOGOUT':
            return {
                ...state,
                userData: {}
            }
        case 'USER_2FA':
            return {
                ...state,
                userData: {
                    ...state.userData,
                    _2FA: action.payload._2FA,
                    telegram_username: action.payload.telegram_username,
                    token: action.payload.token
                }
            }
        case "USER_DISABLED_ACTIONS_BINANCE":
            return {
                ...state,
                userData: {
                    ...state.userData,
                    disabledActionsBinance: action.payload
                }
            }
        default:
            return state
    }
}

export default user;

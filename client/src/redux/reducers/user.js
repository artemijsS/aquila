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
                    _2FA: action.payload
                }
            }
        default:
            return state
    }
}

export default user;

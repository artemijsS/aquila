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
        default:
            return state
    }
}

export default user;

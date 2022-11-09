const initialState = {
    userLoading: true,
    _2FALoading: false
}

const loading = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING_USER':
            return {
                ...state,
                userLoading: action.payload
            }
        case 'LOADING_2FA':
            return {
                ...state,
                _2FALoading: action.payload
            }
        default:
            return state
    }
}

export default loading;

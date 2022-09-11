const initialState = {
    userLoading: true
}

const loading = (state = initialState, action) => {
    switch (action.type) {
        case 'LOADING_USER':
            return {
                ...state,
                userLoading: action.payload
            }
        default:
            return state
    }
}

export default loading;

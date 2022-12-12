const initialState = {
    newSignals: []
}

const signals = (state = initialState, action) => {
    switch (action.type) {
        case 'NEW_SIGNAL':
            return {
                ...state,
                newSignals: [...state.newSignals, action.payload]
            }
        case 'CLOSE_NEW_SIGNAL':
            return {
                ...state,
                newSignals: [...state.newSignals, action.payload]
            }
        case 'CLEAR_NEW_SIGNALS':
            return {
                ...state,
                newSignals: []
            }
        default:
            return state
    }
}

export default signals;

const initialState = {
    updateAllStrategies: false,
    updateMyStrategies: false
}

const updates = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_ALL_STRATEGIES':
            return {
                ...state,
                updateAllStrategies: !state.updateAllStrategies
            }
        case 'UPDATE_MY_STRATEGIES':
            return {
                ...state,
                updateMyStrategies: !state.updateMyStrategies
            }
        default:
            return state
    }
}

export default updates;

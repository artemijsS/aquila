export const addNewSignal = obj => ({
    type: 'NEW_SIGNAL',
    payload: obj
})

export const closeNewSignal = obj => ({
    type: 'CLOSE_NEW_SIGNAL',
    payload: obj
})

export const clearNewSignals = () => ({
    type: 'CLEAR_NEW_SIGNALS'
})

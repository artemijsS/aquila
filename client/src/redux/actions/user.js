import {set2FALoading, setUserLoading} from "./loading";

export const userDataFetch = (obj, path) => {
    return dispatch => {
        dispatch(setUserLoading(true))
        return fetch(process.env.REACT_APP_SERVER + `/api/auth/${path}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(obj)
        })
            .then(resp => resp.json())
            .then(data => {
                if (data.message) {
                    dispatch(setUserLoading(false))
                    return "error"
                } else {
                    if (data.twoFA) {
                        dispatch(setUserLoading(false))
                        dispatch(set2FA({_2FA: true, telegram_username: data.telegram_username, token: data.token}))
                        return "2FA"
                    }
                    localStorage.setItem("token", data.token)
                    const user = {
                        token: data.token,
                        telegram_username: data.username,
                        telegram_chatId: data.telegram_chatId,
                        role: data.role
                    }
                    dispatch(loginUser(user))
                    dispatch(setUserLoading(false))
                }
            })
    }
}

export const getProfileFetch = () => {
    return dispatch => {
        dispatch(setUserLoading(true))
        const token = localStorage.token;
        if (token) {
            return fetch(process.env.REACT_APP_SERVER + "/api/auth/check", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(resp => resp.json())
                .then(data => {
                    if (data.message) {
                        console.log(data.message)
                        localStorage.removeItem("token")
                        dispatch(setUserLoading(false))
                    } else {
                        const user = {
                            token: token,
                            telegram_username: data.username,
                            telegram_chatId: data.telegram_chatId,
                            role: data.role
                        }
                        dispatch(loginUser(user))
                        dispatch(setUserLoading(false))
                    }
                })
        } else {
            dispatch(setUserLoading(false))
        }
    }
}

export const TwoFA = (telegram_username, code) => {
    return dispatch => {
        dispatch(set2FALoading(true))
        return fetch(process.env.REACT_APP_SERVER + `/api/auth/2FA`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({telegram_username: telegram_username, code: code})
        })
            .then(resp => {
                if (resp.status === 203) {
                    dispatch(set2FALoading(false))
                    return 'TL'
                }
                return resp.json()
            })
            .then(data => {
                if (data === 'TL') {
                    return 'TL'
                }
                if (data.message) {
                    dispatch(set2FALoading(false))
                    return "error"
                } else {
                    localStorage.setItem("token", data.token)
                    const user = {
                        token: data.token,
                        telegram_username: data.username,
                        telegram_chatId: data.telegram_chatId,
                        role: data.role
                    }
                    dispatch(loginUser(user))
                    dispatch(set2FALoading(false))
                }
            })
    }
}

export const logoutUser = () => {
    return dispatch => {
        dispatch(logout())
    }
}

export const logout = () => {
    localStorage.removeItem("token")
    return {
        type: 'USER_LOGOUT'
    }
}

const loginUser = obj => ({
    type: 'USER_LOGIN',
    payload: obj
})

export const set2FA = obj => ({
    type: 'USER_2FA',
    payload: obj
})

import { setUserLoading } from "./loading";

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
                    return data.message
                } else {
                    localStorage.setItem("token", data.token)
                    localStorage.setItem("language", data.language)
                    const user = {
                        telegram_username: data.telegram_username,
                        telegram_chatId: data.telegram_chatId
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
                    } else {
                        const user = {
                            telegram_username: data.telegram_username,
                            telegram_chatId: data.telegram_chatId
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

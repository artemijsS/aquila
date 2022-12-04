import axios from "axios";
import store from "../redux/store"
import { toast } from "react-toastify";
import {logoutUser} from "../redux/actions/user";

export const httpGet = async (url) => {
    const token = store.getState().user.userData.token
    return new Promise(function(resolve, reject) {
        axios.get(process.env.REACT_APP_SERVER + url, { headers: { authorization: `Bearer ${token}` } }).then(res => {
            resolve(res)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                store.dispatch(logoutUser())
                reject("Not Auth")
            }
            if (err.response.status === 403) {
                toast.warn("Account disabled, ask for admin support")
                store.dispatch(logoutUser())
                reject("Account disabled")
            }
            if (err.response.status === 404) {
                toast.warn("Session blocked")
                store.dispatch(logoutUser())
                reject("Session blocked")
            }
            reject(err)
        })
    })
}

export const httpPost = async (url, data) => {
    const token = store.getState().user.userData.token
    return new Promise(function(resolve, reject) {
        axios.post(process.env.REACT_APP_SERVER + url, data,{ headers: { authorization: `Bearer ${token}` } }).then(res => {
            resolve(res)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                store.dispatch(logoutUser())
                reject("Not Auth")
            }
            if (err.response.status === 403) {
                toast.warn("Account disabled, ask for admin support")
                store.dispatch(logoutUser())
                reject("Account disabled")
            }
            if (err.response.status === 404) {
                toast.warn("Session blocked")
                store.dispatch(logoutUser())
                reject("Session blocked")
            }
            reject(err)
        })
    })
}

export const httpDelete = async (url) => {
    const token = store.getState().user.userData.token
    return new Promise(function(resolve, reject) {
        axios.delete(process.env.REACT_APP_SERVER + url,{ headers: { authorization: `Bearer ${token}` } }).then(res => {
            resolve(res)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                store.dispatch(logoutUser())
                reject("Not Auth")
            }
            if (err.response.status === 403) {
                toast.warn("Account disabled, ask for admin support")
                store.dispatch(logoutUser())
                reject("Account disabled")
            }
            if (err.response.status === 404) {
                toast.warn("Session blocked")
                store.dispatch(logoutUser())
                reject("Session blocked")
            }
            reject(err)
        })
    })
}

export default { httpGet, httpPost, httpDelete }

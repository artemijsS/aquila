import React, { useEffect, useState, useRef } from 'react'
import {Navigation, TwoFactorAuth} from '../components'
import { Helmet } from "react-helmet";
import ContentLoader from "react-content-loader";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import {logoutUser} from "../redux/actions/user";

function SettingsPage () {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true)

    const [binanceApiKeyEdit, setBinanceApiKeyEdit] = useState(false)
    const [binanceApiSecretEdit, setBinanceApiSecretEdit] = useState(false)

    const [binanceApiKey, setBinanceApiKey] = useState('')
    const [binanceApiSecret, setBinanceApiSecret] = useState('')

    const [_2FA, set2FA] = useState(false)

    const toggleNotificationsRef = useRef()
    const toggle2FARef = useRef()
    const inputKeyRef = useRef()
    const inputSecretRef = useRef()

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER + `/api/user/get`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setUser(res.data)
            setLoading(false)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            toast.error("Error, try later")
        })
    }, [])

    const setToggleLoading = (ref, value, toggle, err) => {
        const className = value ? 'loadingOn' : 'loadingOff'
        if (toggle)
            ref.current.classList.add(className)
        else {
            if (err && toggle) {
                ref.current.checked = false
            }
            if (err && !toggle) {
                ref.current.checked = true
            }

            ref.current.classList.remove(className)
        }
        ref.current.disabled = toggle
    }

    const setInputLoading = (ref, toggle) => {
        ref.current.disabled = toggle
    }

    const updateForToggles = (data, path, ref) => {
        setToggleLoading(toggle2FARef, ref, true)
        axios.post(process.env.REACT_APP_SERVER + `/api/user/` + path, data, {headers: {authorization: `Bearer ${userData.token}`}})
            .then(res => {
                toast.success(res.data.msg)
                setToggleLoading(toggle2FARef, ref, false)
            }, err => {
                if (err.response.status === 401) {
                    toast.warn("Authorization period expired")
                    dispatch(logoutUser())
                }
                if (err.response.status === 402) {
                    set2FA(true)
                    setToggleLoading(toggle2FARef, ref, false)
                    toast.error("2FA is required")
                    return
                }
                setToggleLoading(toggle2FARef, ref, false)
                toast.error("Error, try one more time")
            })
    }

    const update2FA = (e) => {
        const twoFAuthentication = e.target.checked
        updateForToggles({twoFAuthentication}, "updateTwoFAuthentication", toggle2FARef)
    }

    const updateNotifications = (e) => {
        const notifications = e.target.checked
        updateForToggles({notifications}, "updateNotifications", toggleNotificationsRef)
    }

    const onBinanceUpdate = (data, path, ref) => {
        setInputLoading(ref, true)
        axios.post(process.env.REACT_APP_SERVER + `/api/user/` + path, data, {headers: {authorization: `Bearer ${userData.token}`}})
            .then(res => {
                toast.success(res.data.msg)
                setInputLoading(ref, false)
                if (path === "updateBinanceApiKey") {
                    setUser({...user, BINANCE_API_KEY: true})
                    setBinanceApiKeyEdit(false)
                }
                else {
                    setUser({...user, BINANCE_API_SECRET: true})
                    setBinanceApiSecretEdit(false)
                }
            }, err => {
                if (err.response.status === 401) {
                    toast.warn("Authorization period expired")
                    dispatch(logoutUser())
                }
                if (err.response.status === 402) {
                    set2FA(true)
                    setInputLoading(ref, false)
                    toast.error("2FA is required")
                    return
                }
                if (err.response.data.errors) {
                    setInputLoading(ref, false)
                    ref.current.classList.add('red')
                    return
                }
                if (err.response.status === 400) {
                    setInputLoading(ref, false)
                    setUser({...user, BINANCE_API_SECRET: false, BINANCE_API_KEY: false})
                    toast.error(err.response.data.msg)
                    return
                }
                setInputLoading(ref, false)
                toast.error("Error, try one more time")
            })
    }

    const onBinanceApiKeyUpdate = () => {
        setBinanceApiKeyEdit(true)
    }

    const onBinanceApiSecretUpdate = () => {
        setBinanceApiSecretEdit(true)
    }

    const changeBinanceApiKeyHandler = (e) => {
        setBinanceApiKey(e.target.value)
    }

    const changeBinanceApiSecretHandler = (e) => {
        setBinanceApiSecret(e.target.value)
    }

    const on2FAConfirm = () => {
        set2FA(false)
    }

    return (
        <>
        {_2FA ?
            <TwoFactorAuth confirm={true} onConfirm={on2FAConfirm}/>
            :
            <div>
                <Helmet>
                    <title>Settings</title>
                </Helmet>
                <div className="wrapper full-screen">
                    <Navigation activeRoute="settings"/>
                    <div className="main-window">
                        {loading &&
                        <ContentLoader width={"100%"} className={"block user"}>
                            <rect x="0" y="0" rx="10" ry="10" width="5000px" height="100%"/>
                        </ContentLoader>
                        }
                        {!loading &&
                        <div className="block user">
                            <div className="title">
                                <h1>{user.telegram_username}</h1>
                            </div>
                            <div className={"user-info"}>
                                <div className="info">
                                    <div className="label">Telegram chat id</div>
                                    <div className="value disabled">{user.telegram_chatId}</div>
                                </div>
                                <div className="info">
                                    <div className="label">Notifications</div>
                                    <div className="value">
                                        <div className="toggle-pill-color">
                                            <input ref={toggleNotificationsRef} type="checkbox" id={"pillDisNotifications"} onChange={updateNotifications} name="notifications" defaultChecked={user.notifications}/>
                                            <label htmlFor={"pillDisNotifications"}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">2FA</div>
                                    <div className="value">
                                        <div className="toggle-pill-color">
                                            <input ref={toggle2FARef} type="checkbox" id={"pillDisTwoFAuthentication"} onChange={update2FA} name="twoFAuthentication" defaultChecked={user.twoFAuthentication}/>
                                            <label htmlFor={"pillDisTwoFAuthentication"}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Binance API key</div>
                                    <div className="value relative">
                                        {binanceApiKeyEdit ?
                                            <>
                                                <input defaultValue={binanceApiKey} onChange={changeBinanceApiKeyHandler} ref={inputKeyRef} type="text"/>
                                                <svg onClick={() => onBinanceUpdate({BINANCE_API_KEY: binanceApiKey}, "updateBinanceApiKey", inputKeyRef)} className={"save"} width="25" height="25" viewBox="0 0 440 480" xmlns="http://www.w3.org/2000/svg" ><title>save</title><path d="M220 430q81-2 135-55 53-54 55-135-2-81-55-135-54-53-135-55-81 2-135 55-53 54-55 135 2 81 55 135 54 53 135 55l0 0z m-110-190l30-30 57 57 103-117 30 30-132 150-88-90z" /></svg>
                                            </>
                                            :
                                            <button onClick={onBinanceApiKeyUpdate} className={user.BINANCE_API_KEY ? "" : "save"}>{user.BINANCE_API_KEY ? "Change" : "Add"}</button>
                                        }
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Binance API secret</div>
                                    <div className="value relative">
                                        {binanceApiSecretEdit ?
                                            <>
                                                <input defaultValue={binanceApiSecret} onChange={changeBinanceApiSecretHandler} ref={inputSecretRef} type="text"/>
                                                <svg onClick={() => onBinanceUpdate({BINANCE_API_SECRET: binanceApiSecret}, "updateBinanceApiSecret", inputSecretRef)} className={"save"} width="25" height="25" viewBox="0 0 440 480" xmlns="http://www.w3.org/2000/svg" ><title>save</title><path d="M220 430q81-2 135-55 53-54 55-135-2-81-55-135-54-53-135-55-81 2-135 55-53 54-55 135 2 81 55 135 54 53 135 55l0 0z m-110-190l30-30 57 57 103-117 30 30-132 150-88-90z" /></svg>
                                            </>
                                            :
                                            <button onClick={onBinanceApiSecretUpdate} className={user.BINANCE_API_SECRET ? "" : "save"}>{user.BINANCE_API_SECRET ? "Change" : "Add"}</button>
                                        }
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Password</div>
                                    <div className="value">
                                        <button>Change</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default SettingsPage;


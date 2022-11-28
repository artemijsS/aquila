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

    const [_2FA, set2FA] = useState(false)

    const toggleNotificationsRef = useRef()
    const toggle2FARef = useRef()

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

    const onBinanceApiKeyUpdate = () => {
        setBinanceApiKeyEdit(true)
    }

    const onBinanceApiSecretUpdate = () => {
        setBinanceApiSecretEdit(true)
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
                                    <div className="value">
                                        {binanceApiKeyEdit ?
                                            <input type="text"/>
                                            :
                                            <button onClick={onBinanceApiKeyUpdate} className={user.BINANCE_API_KEY ? "" : "save"}>{user.BINANCE_API_KEY ? "Change" : "Add"}</button>
                                        }
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Binance API secret</div>
                                    <div className="value">
                                        {binanceApiSecretEdit ?
                                            <input type="text"/>
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


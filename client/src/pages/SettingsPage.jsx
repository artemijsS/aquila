import React, { useEffect, useState } from 'react'
import { Navigation } from '../components'
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

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER + `/api/user/get`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setUser(res.data)
            console.log(res.data)
            setLoading(false)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            toast.error("Error, try later")
            setLoading(false)
        })
    }, [])

    return (
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
                                <h1>artemijss</h1>
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
                                            <input type="checkbox" id={"pillDisNotifications"} name="notifications" defaultChecked={user.notifications}/>
                                            <label htmlFor={"pillDisNotifications"}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">2FA</div>
                                    <div className="value">
                                        <div className="toggle-pill-color">
                                            <input type="checkbox" id={"pillDisTwoFAuthentication"} name="twoFAuthentication" defaultChecked={user.twoFAuthentication}/>
                                            <label htmlFor={"pillDisTwoFAuthentication"}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Binance API key</div>
                                    <div className="value">
                                        <button>Change</button>
                                    </div>
                                </div>
                                <div className="info">
                                    <div className="label">Binance API secret</div>
                                    <div className="value">
                                        <button>Change</button>
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
    )
}

export default SettingsPage;


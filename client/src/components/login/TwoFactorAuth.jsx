import React, {useEffect, useRef, useState} from 'react'
import './TwoFactorAuth.css'
import logo from "../../assets/logo.png";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {logoutUser, set2FA, TwoFA} from "../../redux/actions/user";
import { toast } from "react-toastify";

function TwoFactorAuth ({confirm = false, onConfirm = null}) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [disabledInputs, setDisabledInputs] = useState(false)

    const inputs = {
        "1": useRef(),
        "2": useRef(),
        "3": useRef(),
        "4": useRef()
    }

    useEffect(() => {
        if (!confirm)
            axios.post(process.env.REACT_APP_SERVER + "/api/auth/2FAGenerate", {token: userData.token})
    }, [])

    const onSubmit = (e) => {
        e.preventDefault()
    }

    const onInput = (e, id, to = 4) => {
        let val = inputs[id].current.value.length
        if (id === 4) {
            setDisabledInputs(true)
            let code = ""
            Object.keys(inputs).map((key, index) => {
                code = code + inputs[index + 1].current.value
            })
            if (confirm) {
                axios.post(process.env.REACT_APP_SERVER + "/api/auth/2FAConfirm", {code}, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
                    onConfirm()
                    toast.success(res.data.message)
                }, err => {
                    if (err.response.status === 401) {
                        toast.warn("Authorization period expired")
                        dispatch(logoutUser())
                        return
                    }
                    if (err.response.status === 203) {
                        onConfirm()
                    }
                    toast.error(err.response.data.message)
                })
            } else {
                dispatch(TwoFA(userData.telegram_username, code)).then(res => {
                    if (res === "error") {
                        dispatch(set2FA(false))
                        toast.error('Incorrect code, try one more time');
                    } else if (res === "TL") {
                        dispatch(set2FA(false))
                        toast.warn('Time limit exceeded')
                    } else {
                        toast.success('Hello =)')
                    }
                })
            }
        }
        if (val > 1) {
            e.target.value = e.target.value.slice(0,1)
        } else if (val === 1) {
            inputs[to].current.focus()
        }
    }

    const handleKeyDown = (event, to) => {
        if (event.key === 'Backspace') {
            inputs[to].current.focus()
        }
    }

    const onBackClick = () => {
        if (confirm)
            onConfirm()
        else
            dispatch(set2FA(false))
    }

    return (
        <div className="login-screen">
            <div className="login">
                <img className="login-logo" src={logo} alt="logo"/>
                <div className="container">
                    <form id="2FAForm" onSubmit={onSubmit}>
                        <h1>TWO-FACTOR AUTHENTICATION</h1>
                        <div className="form__group form__pincode">
                            <label>Enter 4-digit code</label>
                            <input ref={inputs[1]} type="number" name="pincode-1" maxLength="1" pattern="[0-9]" tabIndex="1" disabled={disabledInputs}
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 1, 2)}/>
                            <input ref={inputs[2]} type="tel" name="pincode-2" maxLength="1" pattern="[0-9]" tabIndex="2" disabled={disabledInputs}
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 2,3)} onKeyDown={event => handleKeyDown(event, 1)}/>
                            <input ref={inputs[3]} type="tel" name="pincode-3" maxLength="1" pattern="[0-9]" tabIndex="3" disabled={disabledInputs}
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 3,4)} onKeyDown={event => handleKeyDown(event, 2)}/>
                            <input ref={inputs[4]} type="tel" name="pincode-4" maxLength="1" pattern="[0-9]" tabIndex="4" disabled={disabledInputs}
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 4)} onKeyDown={event => handleKeyDown(event, 3)}/>
                        </div>
                        <div className="form__buttons">
                            <button className="mrt10" onClick={onBackClick} disabled={disabledInputs}>Back</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TwoFactorAuth;


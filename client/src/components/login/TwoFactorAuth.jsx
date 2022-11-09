import React, { useRef } from 'react'
import './TwoFactorAuth.css'
import logo from "../../assets/logo.png";

function TwoFactorAuth () {

    const inputs = {
        "1": useRef(),
        "2": useRef(),
        "3": useRef(),
        "4": useRef()
    }

    const onSubmit = (e) => {
        e.preventDefault()
    }

    const onInput = (e, id, to = 4) => {
        let val = inputs[id].current.value.length
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

    return (
        <div className="login-screen">
            <div className="login">
                <img className="login-logo" src={logo} alt="logo"/>
                <div className="container">
                    <form id="2FAForm" onSubmit={onSubmit}>
                        <h1>TWO-FACTOR AUTHENTICATION</h1>
                        <div className="form__group form__pincode">
                            <label>Enter 6-digit code from your authenticator application</label>
                            <input ref={inputs[1]} type="number" name="pincode-1" maxLength="1" pattern="[0-9]" tabIndex="1"
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 1, 2)}/>
                            <input ref={inputs[2]} type="tel" name="pincode-2" maxLength="1" pattern="[0-9]" tabIndex="2"
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 2,3)} onKeyDown={event => handleKeyDown(event, 1)}/>
                            <input ref={inputs[3]} type="tel" name="pincode-3" maxLength="1" pattern="[0-9]" tabIndex="3"
                                   placeholder="·" autoComplete="off" onInput={event => onInput(event, 3,4)} onKeyDown={event => handleKeyDown(event, 2)}/>
                            <input ref={inputs[4]} type="tel" name="pincode-4" maxLength="1" pattern="[0-9]" tabIndex="4"
                                   placeholder="·" autoComplete="off"onInput={event => onInput(event, 4)} onKeyDown={event => handleKeyDown(event, 3)}/>
                        </div>
                        <div className="form__buttons">
                            <button disabled={true}>Continue</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TwoFactorAuth;


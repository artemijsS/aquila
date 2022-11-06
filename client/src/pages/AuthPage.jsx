import React, { useState } from 'react'
import { Helmet } from 'react-helmet';
import { useDispatch } from "react-redux";
import { userDataFetch } from "../redux/actions/user";
import logo from '../assets/logo.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AuthPage () {

    const dispatch = useDispatch()

    const [form, setForm] = useState({
        telegram_username: '', password: ''
    })

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const submit = event => {
        event.preventDefault()
        dispatch(userDataFetch(form,'login')).then(res => {
            if (res) {
                toast.error('Incorrect data, try one more time');
            } else {
                toast.success('Hello =)')
            }
        })
    }

    return (
        <div>
            <Helmet>
                <title>Login</title>
            </Helmet>
            <div className="login-screen">
                <div className="login">
                    <img className="login-logo" src={logo} alt="logo"/>
                    <form className="formLogin" onSubmit={submit}>
                        <h1>Login</h1>
                        <div className="inputs">
                            <div className="form__group field">
                                <input className="form__field" placeholder="Telegram username" type="text" id="telegram_username" name="telegram_username" required onChange={changeHandler}/>
                                <label className="form__label" htmlFor="email">Telegram username</label>
                            </div>
                            <div className="form__group field">
                                <input className="form__field" placeholder="Password" type="password" id="pass" name="password" minLength="6" required onChange={changeHandler}/>
                                <label className="form__label" htmlFor="pass">Password</label>
                            </div>
                        </div>
                        <button type="submit">Sign in</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AuthPage;


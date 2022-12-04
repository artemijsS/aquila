import React, {useEffect, useState} from 'react'
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from "react-redux";
import { userDataFetch } from "../redux/actions/user";
import logo from '../assets/logo.png';
import { toast } from 'react-toastify';
import { TwoFactorAuth } from '../components';

function AuthPage () {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [form, setForm] = useState({
        telegram_username: '', password: ''
    })
    const [_2FA, set2FA] = useState(false)

    const changeHandler = event => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    useEffect(() => {
        set2FA(userData._2FA)
    }, [userData])

    const submit = event => {
        event.preventDefault()
        dispatch(userDataFetch(form,'login')).then(res => {
            if (res.error) {
                toast.error(res.msg);
            } else if (res === "2FA") {
                set2FA(true)
                toast.warn('2FA is necessary')
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
            {_2FA &&
                <TwoFactorAuth/>
            }
            {!_2FA &&
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
            }

        </div>
    )
}

export default AuthPage;


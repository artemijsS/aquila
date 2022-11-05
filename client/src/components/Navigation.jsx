import React from 'react'
import { useSelector, useDispatch } from "react-redux";
import {logoutUser} from "../redux/actions/user";

function Navigation () {
    const dispatch = useDispatch();

    const { userData } = useSelector(({ user }) => user);

    const logOut = () => {
        dispatch(logoutUser())
    }

    return (
        <div className="navigation">
            <div className="username">
                <svg width="40" height="40" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>user</title><path d="M240 270q38-1 64-26 25-26 26-64-1-38-26-64-26-25-64-26-38 1-64 26-25 26-26 64 1 38 26 64 26 25 64 26l0 0z m-120 120l240 0 0-30q-1-26-17-43-17-16-43-17l-120 0q-26 1-43 17-16 17-17 43l0 30z" /></svg>
                <div>{ userData.telegram_username }</div>
            </div>
            <div className="menu">
                <div className="link active">
                    <svg width="30" height="30" viewBox="0 0 458 480" xmlns="http://www.w3.org/2000/svg" ><title>chart-pie</title><path d="M210 420q65-2 107-44 42-42 43-106l-150 0 0-150q-64 1-106 43-42 42-44 107 2 64 44 106 42 42 106 44l0 0z m40-190l140 0q-1-60-41-99-39-40-99-41l0 140z" /></svg>
                    <div>Overview</div>
                </div>
                <div className="link">
                    <svg width="30" height="30" viewBox="0 0 420 480" xmlns="http://www.w3.org/2000/svg" ><title>chart-line</title><path d="M90 290l80-80 60 60 130-130-30-30-100 100-60-60-110 110 30 30z m-30 130l280 0 0-40-280 0 0 40z" /></svg>
                    <div>Strategies</div>
                </div>
                <div className="link">
                    <svg width="30" height="30" viewBox="0 0 440 480" xmlns="http://www.w3.org/2000/svg" ><title>radio-full</title><path d="M220 430q81-2 135-55 53-54 55-135-2-81-55-135-54-53-135-55-81 2-135 55-53 54-55 135 2 81 55 135 54 53 135 55l0 0z" /></svg>
                    <div>Signals</div>
                </div>
                <div className="down">
                    <div className="link">
                        <svg width="30" height="30" viewBox="0 0 500 480" xmlns="http://www.w3.org/2000/svg" ><title>cog</title><path d="M214 420l72 0 23-77 78 19 36-64-55-58 55-58-36-64-78 19-23-77-72 0-23 77-78-19-36 64 55 58-55 58 36 64 78-19 23 77z m-24-180q1-25 18-42 17-17 42-18 25 1 42 18 17 17 18 42-1 25-18 42-17 17-42 18-25-1-42-18-17-17-18-42l0 0z" /></svg>
                        <div>Settings</div>
                    </div>
                    {userData.role === "admin" &&
                        <div className="link">
                            <div>Admin</div>
                        </div>
                    }
                    <div className="link" onClick={logOut}>
                        <svg width="30" height="30" viewBox="0 0 428 480" xmlns="http://www.w3.org/2000/svg" ><title>cancel</title><path d="M90 390l120-120 130 120 30-30-130-120 130-120-30-30-130 120-120-120-30 30 120 120-120 120 30 30z" /></svg>
                        <div>Exit</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navigation;


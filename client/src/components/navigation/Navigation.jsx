import React from 'react'
import NavCom from './nav-com'
import {useSelector} from "react-redux";


function Navigation ({activeRoute}) {

    const { userData } = useSelector(({ user }) => user);

    return (
        <>
            <div className="mobile-nav">
                <input className="checkbox" type="checkbox" name="" id=""/>
                <div className="hamburger-lines">
                    <span className="line line1"/>
                    <span className="line line2"/>
                    <span className="line line3"/>
                </div>
                <div className="menu-mobile">
                    <NavCom activeRoute={activeRoute} userData={userData}/>
                </div>
            </div>
            <div className="navigation">
                <div className="username">
                    <svg width="40" height="40" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>user</title><path d="M240 270q38-1 64-26 25-26 26-64-1-38-26-64-26-25-64-26-38 1-64 26-25 26-26 64 1 38 26 64 26 25 64 26l0 0z m-120 120l240 0 0-30q-1-26-17-43-17-16-43-17l-120 0q-26 1-43 17-16 17-17 43l0 30z" /></svg>
                    <div>{ userData.telegram_username }</div>
                </div>
                <NavCom activeRoute={activeRoute}/>
            </div>
        </>
    )
}

export default Navigation;


import React, { useEffect, useState } from 'react'
import NavCom from './nav-com'
import {useSelector} from "react-redux";


function Navigation ({activeRoute}) {

    const { userData } = useSelector(({ user }) => user);

    const [minimized, setMinimized] = useState(0);

    useEffect(() => {
        function onScroll() {
            let currentPosition = window.pageYOffset
            if ((currentPosition <= 0 ? 0 : currentPosition) > 0) {
                setMinimized(1)
            } else {
                setMinimized(2)
            }
        }

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <div className={minimized === 1 ? "mobile-nav minimized" : "mobile-nav"}>
                <input className="checkbox" type="checkbox" name="" id=""/>
                <div className="hamburger-lines">
                    <span className="line line1"/>
                    <span className="line line2"/>
                    <span className="line line3"/>
                </div>
                <div className="menu-mobile">
                    <NavCom activeRoute={activeRoute}/>
                </div>
            </div>
            <div id="nav" className={minimized === 0 ? "navigation" : minimized === 1 ? "navigation fadeOut" : "navigation fadeIn" }>
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


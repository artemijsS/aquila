import React from 'react'
import { useSelector } from "react-redux";

function Navigation () {
    const { userData } = useSelector(({ user }) => user);

    return (
        <div className="navigation">
            <div className="username">{ userData.telegram_username }</div>
            <div className="menu">
                <div className="link active">Overview</div>
                <div className="link">Strategies</div>
                <div className="link">Signals</div>
                <div className="down">
                    <div className="link">Settings</div>
                </div>
            </div>
        </div>
    )
}

export default Navigation;


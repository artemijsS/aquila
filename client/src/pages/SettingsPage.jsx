import React from 'react'
import { Navigation } from '../components'
import {Helmet} from "react-helmet";

function SettingsPage () {


    return (
        <div>
            <Helmet>
                <title>Settings</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="settings"/>
                <div className="main-window">

                </div>
            </div>
        </div>
    )
}

export default SettingsPage;


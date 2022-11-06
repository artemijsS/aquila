import React from 'react'
import { Navigation } from '../components'
import { Helmet } from "react-helmet";

function StrategiesPage () {


    return (
        <div>
            <Helmet>
                <title>Strategies</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="strategies"/>
                <div className="main-window">

                </div>
            </div>
        </div>
    )
}

export default StrategiesPage;


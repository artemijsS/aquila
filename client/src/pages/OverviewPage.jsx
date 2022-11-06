import React from 'react'
import { Navigation } from '../components'
import { Helmet } from "react-helmet";

function OverviewPage () {


    return (
        <div>
            <Helmet>
                <title>Overview</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="overview"/>
                <div className="main-window">

                </div>
            </div>
        </div>
    )
}

export default OverviewPage;


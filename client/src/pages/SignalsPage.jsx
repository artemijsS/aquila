import React from 'react'
import { Navigation } from '../components'
import { Helmet } from "react-helmet";

function SignalsPage () {


    return (
        <div>
            <Helmet>
                <title>Signals</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="signals"/>
                <div className="main-window">

                </div>
            </div>
        </div>
    )
}

export default SignalsPage;


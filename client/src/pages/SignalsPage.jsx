import React from 'react'
import { Navigation } from '../components'
import { Helmet } from "react-helmet";
import { SignalBlock } from '../components'

function SignalsPage () {


    return (
        <div>
            <Helmet>
                <title>Signals</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="signals"/>
                <div className="main-window">
                    <SignalBlock/>
                </div>
            </div>
        </div>
    )
}

export default SignalsPage;


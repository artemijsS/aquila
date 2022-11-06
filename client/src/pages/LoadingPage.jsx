import React from 'react'
import { Helmet } from "react-helmet";

function LoadingPage () {

    return (
        <div className="full-screen flex jus-con-cen al-it-cen">
            <Helmet>
                <title>Loading</title>
            </Helmet>
            <div className="loader"/>
        </div>
    )
}

export default LoadingPage;


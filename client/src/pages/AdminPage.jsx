import React from 'react'
import { Helmet } from "react-helmet";
import { Navigation, AdminStrategies } from "../components";

function AdminPage () {

    return (
        <div>
            <Helmet>
                <title>Admin</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="admin"/>
                <div className="main-window">
                    <AdminStrategies />
                    {/*<AdminStrategies />*/}
                    {/*<AdminStrategies />*/}
                </div>
            </div>
        </div>
    )
}

export default AdminPage;


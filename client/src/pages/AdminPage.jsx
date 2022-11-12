import React from 'react'
import { Helmet } from "react-helmet";
import { Navigation, Block, AdminStrategyCard } from "../components";

function AdminPage () {

    return (
        <div>
            <Helmet>
                <title>Admin</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="admin"/>
                <div className="main-window">
                    <Block title={"Strategies"} objectForm={{urlId: '', name: '', description: '', percentage: '', source: ''}} urlPath={"strategies"}>
                        <AdminStrategyCard/>
                    </Block>
                </div>
            </div>
        </div>
    )
}

export default AdminPage;


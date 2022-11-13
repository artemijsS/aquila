import React from 'react'
import { Helmet } from "react-helmet";
import { Navigation, Block, AdminStrategyCard, AdminUserCard, AdminNewUserListCard } from "../components";

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
                    <Block title={"Users"} objectForm={{telegram_username: '', telegram_chatId: '', role: '', description: '', twoFAuthentication: '', disabled: ''}} urlPath={"user"} newElement={false}>
                        <AdminUserCard/>
                    </Block>
                    <Block title={"New users access"} objectForm={{telegram_username: ''}} urlPath={"userNew"} list={true}>
                        <AdminNewUserListCard/>
                    </Block>
                </div>
            </div>
        </div>
    )
}

export default AdminPage;


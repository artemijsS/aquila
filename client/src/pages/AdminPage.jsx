import React from 'react'
import { Helmet } from "react-helmet";
import {
    Navigation,
    Block,
    AdminStrategyCard,
    AdminUserCard,
    AdminNewUserListCard,
    AdminCryptoListCard
} from "../components";

function AdminPage () {

    return (
        <div>
            <Helmet>
                <title>Admin</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="admin"/>
                <div className="main-window">
                    <Block title={"Strategies"} objectForm={{urlId: '', name: '', description: '', percentage: '', source: '', crypto: []}} urlPath={"strategies"} getAllInputPath={"crypto"}>
                        <AdminStrategyCard/>
                    </Block>
                    <Block title={"Users"} objectForm={{telegram_username: '', telegram_chatId: '', role: '', twoFAuthentication: '', disabled: '', notifications: ''}} urlPath={"user/admin"} newElement={false}>
                        <AdminUserCard/>
                    </Block>
                    <Block title={"User invitations"} objectForm={{telegram_username: ''}} urlPath={"userNew"} list={true}>
                        <AdminNewUserListCard/>
                    </Block>
                    <Block title={"Crypto"} objectForm={{name: '', quantityPrecision: ''}} urlPath={"crypto"} updatePath={"updateBinanceCrypto"} list={true} update={true} newElement={false}>
                        <AdminCryptoListCard/>
                    </Block>
                </div>
            </div>
        </div>
    )
}

export default AdminPage;


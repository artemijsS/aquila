import React from 'react'
import { Helmet } from "react-helmet"
import {
    Navigation,
    Block,
    StrategyCard
} from "../components";

function StrategiesPage () {


    return (
        <div>
            <Helmet>
                <title>Strategies</title>
            </Helmet>
            <div className="wrapper full-screen">
                <Navigation activeRoute="strategies"/>
                <div className="main-window">
                    <Block title={"My strategies"} own={true} newElement={false} objectForm={{urlId: '', name: '', description: '', source: '', crypto: []}} urlPath={"userStrategies"}>
                        <StrategyCard/>
                    </Block>
                    <Block title={"Add new strategy"} newElement={false} objectForm={{urlId: '', name: '', description: '', source: '', crypto: []}} urlPath={"strategies/user"}>
                        <StrategyCard/>
                    </Block>
                </div>
            </div>
        </div>
    )
}

export default StrategiesPage;


import React, { useEffect, useState } from 'react'
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import { httpGet, httpPost } from "../../utils/http"
import { Overall, StrategiesStats, CryptosStats, CryptoStat, ProfitChart } from '../index'

function OverviewBlock () {

    const [overview, setOverview] = useState({})
    const [loading, setLoading] = useState(true)
    const [noOverview, setNoOverview] = useState(false)

    useEffect(() => {
        setLoading(true)
        httpGet('/api/overview/get').then(res => {
            setOverview(res.data)
            if (!res.data.closedSignalsCount)
                setNoOverview(true)
            setLoading(false)
        }, _err => {
            toast.error("Error with loading overview")
        })
    }, [])

    return (
        <div className="block">
            <div className="title">
                <h1>Overview</h1>
            </div>
            <div className={"cards min-gap"}>
                {loading &&
                    <ContentLoader width={"100%"} className={"card"}>
                        <rect x="0" y="0" rx="10" ry="10" width="5000px" height="100%" />
                    </ContentLoader>
                }
                {!loading && !noOverview &&
                    <>
                        <Overall overview={overview}/>
                        <StrategiesStats overview={overview}/>
                        <CryptosStats overview={overview}/>
                        <ProfitChart isStrategies={true}/>
                        <CryptoStat title={"Top Crypto"} crypto={overview.topCrypto}/>
                        <CryptoStat title={"Worst Crypto"} crypto={overview.worstCrypto}/>
                    </>
                }
                {!loading && noOverview &&
                <div className={"card"}>
                    <blockquote className="blockquote"><p>there is no overview yet, wait for it</p></blockquote>
                </div>
                }
            </div>
        </div>
    )
}

export default OverviewBlock;


import React, { useEffect, useState } from 'react'
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import { httpGet, httpPost } from "../../utils/http"
import { Overall, StrategiesStats, CryptosStats, CryptoStat } from '../index'

function OverviewBlock () {

    const [overview, setOverview] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        httpGet('/api/overview/get').then(res => {
            setOverview(res.data)
            console.log(res.data)
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
                {!loading && overview.closedSignalsCount &&
                    <>
                        <Overall overview={overview}/>
                        <StrategiesStats overview={overview}/>
                        <CryptosStats overview={overview}/>
                        <CryptoStat title={"Top Crypto"} crypto={overview.topCrypto}/>
                        <CryptoStat title={"Worst Crypto"} crypto={overview.worstCrypto}/>
                    </>
                }
            </div>
        </div>
    )
}

export default OverviewBlock;


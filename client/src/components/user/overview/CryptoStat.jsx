import React from 'react'

function CryptoStat ({ crypto, title }) {


    return (
        <div className="card fixed full">
            <div className="name">
                <h1>{title}</h1>
            </div>
            <div className="info">
                <div className="data">
                    <div className="key big" title={"crypto"}><span>{crypto._id}</span></div>
                    <div className="value big" title={"total profit"}>{crypto.cryptoProfit}$</div>
                    <div className="value big" title={"win rate"}>{Math.round(crypto.winRate)}%</div>
                </div>
            </div>
        </div>
    )
}

export default CryptoStat;


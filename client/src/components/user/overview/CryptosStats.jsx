import React from 'react'

function CryptosStats ({ overview }) {


    return (
        <div className="card fixed">
            <div className="name">
                <h1>Cryptos</h1>
            </div>
            <div className="info left">
                {overview.cryptoWinRates.map((crypto, i) =>
                    <div className="data" key={i}>
                        <div className="key" title="crypto name">{i+1 + ". " + crypto.crypto}</div>
                        <div className="value" title={"crypto win rate"}>{crypto.winRate}%</div>
                        <div className="key small" title={"total profit of crypto and signals count wit it"}>{crypto.totalProfit}$ <br/> {crypto.totalTrades} signals</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CryptosStats;


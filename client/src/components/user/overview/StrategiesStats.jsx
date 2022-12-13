import React from 'react'

function StrategiesStats ({ overview }) {


    return (
        <div className="card fixed">
            <div className="name">
                <h1>Strategies</h1>
            </div>
            <div className="info left">
                {overview.topStrategies.map((strategy, i) =>
                    <div className="data" key={i}>
                        <div className="key" title="strategy name">{i+1 + ". " + strategy.strategyName}</div>
                        <div className="value" title={"total profit"}>{strategy.totalProfit}$</div>
                        <div className="key small" title={"best crypto and total profit of it"}>{strategy.topCrypto} <br/> {strategy.totalProfit}$</div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StrategiesStats;


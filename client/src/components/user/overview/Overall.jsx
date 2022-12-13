import React from 'react'

function OverallStats ({ overview }) {


    return (
        <div className="card fixed">
            <div className="name">
                <h1>Overall</h1>
            </div>
            <div className="info">
                <div className="data" title="open">
                    <div className="key"><span style={{left: 0, right: 0, margin: "auto", width: "25px", height: "25px"}} className={"open-signal"}/></div>
                    <div className="value">{overview.openSignalsCount}</div>
                </div>
                <div className="data" title="closed">
                    <div className="key">Closed</div>
                    <div className="value">{overview.closedSignalsCount}</div>
                </div>
                <div className="data" title="wins">
                    <div className="key"><span className={"win"}>&#10004;</span></div>
                    <div className="value">{overview.winSignalsCount}</div>
                </div>
                <div className="data" title="win rate">
                    <div className="key"><span className={"win"}>&#9824;</span></div>
                    <div className="value">{overview.winRate}%</div>
                </div>
                <div className="data" title="profit">
                    <div className="key"><span className={"win"}>&#36;</span></div>
                    <div className="value">{overview.profit}$</div>
                </div>
            </div>
        </div>
    )
}

export default OverallStats;


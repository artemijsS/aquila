import React, { useState } from 'react'
import {httpGet, httpPost} from "../../utils/http"

function Signal ({ signal }) {

    const [open, setOpen] = useState(!signal.closed)

    return (
        <div className={"card signal " + (open ? "open" : "")}>
            {open &&
                <span className="open-signal"/>
            }
            <div className="cubes">
                {!open &&
                    <span className={signal.profit > 0 ? "cube profit plus" : "cube profit minus"}>{signal.profit < 0 && "- "}{signal.profit > 0 && "+ "}{Math.abs(signal.profit)}$</span>
                }
                <span className={"cube leverage " + signal.position}>{signal.leverage}x</span>
                <span className={"cube position " + signal.position}>{signal.position}</span>
            </div>
            {!open &&
                <div className={signal.profit > 0 ? "profitBg plus" : "profitBg minus"}/>
            }
            <div className="strategy">
                <h1>{signal.strategyName}</h1>
            </div>
            <div className="data">
                <h3>XRP</h3>
                <h3>{signal.amount}$</h3>
                <h3>Entry - {signal.entryPrice}$</h3>
                {!open &&
                    <h3>Exit - {signal.exitPrice}$</h3>
                }
            </div>
            <div className="time">{signal.created_at}</div>
        </div>

    )
}

export default Signal;


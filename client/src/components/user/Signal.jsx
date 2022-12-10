import React, {useState, useRef, useEffect} from 'react'
import Select from 'react-select'
import {httpGet, httpPost} from "../../utils/http"

function Signal ({ signal, key = null }) {

    const [open, setOpen] = useState(signal.closed)

    useEffect(() => {
        console.log(1)
    }, [])

    return (
        <div className={"card signal " + (open ? "open" : "")} key={key}>
            <div className="cubes">
                {!open &&
                    <span className={signal.profit > 0 ? "cube profit plus" : "cube profit minus"}>{signal.profit > 0 ? "+ " : "- "}{Math.abs(signal.profit)}$</span>
                }
                <span className={"cube leverage " + signal.position}>{signal.leverage}x</span>
                <span className={"cube position " + signal.position}>{signal.position}</span>
            </div>
            {!open &&
                <div className={signal.profit > 0 ? "profitBg plus" : "profitBg minus"}/>
            }
            <div className="strategy">
                <h1>test</h1>
            </div>
            <div className="data">
                <h3>XRP</h3>
                <h3>{signal.amount}$</h3>
                <h3>Entry - {signal.entryPrice}$</h3>
                {!open &&
                    <h3>Exit - {signal.exitPrice}$</h3>
                }
            </div>
            <div className="time">09/12/2022 15:43</div>
        </div>

    )
}

export default Signal;


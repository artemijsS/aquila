import React, {useState, useRef, useEffect} from 'react'
import Select from 'react-select'
import {httpGet, httpPost} from "../../utils/http"

function Signal ({ signal, key = null }) {

    const [open, setOpen] = useState(signal.closed)
    const [position, setPosition] = useState(signal.position)
    const [leverage, setLeverage] = useState(signal.leverage)

    useEffect(() => {
        console.log(position)
    }, [])

    return (
        <>
        {open ?
            <div className={"card signal open"} key={key}>
                <span className="open-signal"/>
                <div className="cubes">
                    <span className={"cube leverage " + position}>{leverage}x</span>
                    <span className={"cube position " + position}>{position}</span>
                </div>
                <div className="strategy">
                    <h1>test</h1>
                </div>
                <div className="data">
                    <h3>XRP</h3>
                    <h3>6$</h3>
                </div>
                <div className="time">09/12/2022 15:43</div>
            </div>
            :
            <div className={"card signal"} key={key}>
                <div className="cubes">
                    <span className={"cube leverage " + position}>{leverage}x</span>
                    <span className={"cube position " + position}>{position}</span>
                </div>
                <div className="strategy">
                    <h1>test</h1>
                </div>
                <div className="data">
                    <h3>Profit: test</h3>
                </div>
                <div className="time">09/12/2022 15:43</div>
            </div>
        }
        </>

    )
}

export default Signal;


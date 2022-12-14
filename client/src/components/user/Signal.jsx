import React, {useRef, useState} from 'react'
import { httpDelete } from "../../utils/http"
import { toast } from "react-toastify";

function Signal ({ signal }) {

    const [open, setOpen] = useState(!signal.closed)

    const cardRef = useRef()

    const deleteOpenSignal = () => {
        if (window.confirm('Are you sure you want to delete this open signal ' + signal.strategyName + ' ' + signal.crypto + '?')) {
            httpDelete(`/api/signals/actions/delete?signalId=${signal._id}`).then(_res => {
                cardRef.current.classList.add('delete')
                toast.success(signal.strategyName + ' ' + signal.crypto + " signal deleted!")
            }, _err => {
                toast.error("Error with deleting this signal")
            })
        }
    }

    return (
        <div ref={cardRef} className={"card signal " + (open ? "open" : "")}>
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
                <h3>{signal.crypto}</h3>
                <h3>{signal.amount}$</h3>
                <h3>Entry - {signal.entryPrice}$</h3>
                {!open &&
                    <h3>Exit - {signal.exitPrice}$</h3>
                }
            </div>
            {open &&
            <div className="open-signal-del">
                <svg onClick={() => deleteOpenSignal()} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
            </div>
            }
            <div className="time">{signal.created_at}</div>
        </div>

    )
}

export default Signal;


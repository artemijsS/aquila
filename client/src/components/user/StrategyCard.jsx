import React, {useState, useRef, useEffect} from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import {updateAllStrategies, updateMyStrategies} from "../../redux/actions/updates";
import {httpGet, httpPost} from "../../utils/http"

function StrategyCard ({ data, key = null, own = false, onDeleting = null }) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [strategy, setStrategy] = useState(data)
    const [cryptos, setCryptos] = useState([])
    const [edit, setEdit] = useState(false)
    const [ownAdd, setOwnAdd] = useState(own)

    const inputRefs = {
        amount: useRef(),
        crypto: useRef(),
        leverage: useRef()
    }

    const animatedComponents = makeAnimated();

    const changeHandler = (event) => {
        setStrategy({ ...strategy, [event.target.name]: event.target.value })
    }

    const onCloseEdit = () => {
        setEdit(false)
    }

    const onEdit = () => {
        if (userData.disabledActionsBinance) {
            toast.warn("You need to add Binance API key and API secret first in settings!")
            return
        }
        setEdit(true)
    }

    const onDelete = () => {
        if (userData.disabledActionsBinance) {
            toast.warn("You need add to Binance API key and API secret first in settings!")
            return
        }
        if (window.confirm('Are you sure you want to delete ' + strategy.name + '?')) {
            httpPost(`/api/userStrategies/disable`, {userStrategyId: strategy._id}).then(_res => {
                onDeleting()
                toast.success('Strategy successfully deleted!')
                dispatch(updateAllStrategies())
            }, err => {
                if (err.response.data.errors) {
                    toast.error("Problems with data")
                } else if (err.response.data.error === 1) {
                    toast.warn(err.response.data.msg)
                } else {
                    toast.error("Error, try one more time")
                }
            })
        }
    }

    const onAdd = (path) => {
        httpPost(`/api/userStrategies/${path}`, {userStrategyId: strategy._id, crypto: strategy.crypto, amount: strategy.amount, leverage: strategy.leverage, strategyId: strategy._id}).then(_res => {
            if (path === "add") {
                onDeleting()
                toast.success('Strategy successfully added!')
                dispatch(updateMyStrategies())
            } else {
                toast.success('Strategy successfully edited!')
                setEdit(false)
            }
        }, err => {
            if (err.response.data.errors) {
                toast.error("Please fill all required fields")
                Object.keys(inputRefs).forEach(key => {
                    inputRefs[key].current.classList.remove('red')
                })
                err.response.data.errors.forEach(er =>
                    inputRefs[er.param].current.classList.add('red')
                )
            } else if (err.response.data.error === 1) {
                toast.warn(err.response.data.msg)
            } else {
                toast.error("Error, try one more time")
            }
        })
    }

    useEffect(() => {
        let id = strategy._id
        if (own)
            id = strategy.strategyId
        httpGet(`/api/crypto/getAll?strategyId=${id}`).then(res => {
            setCryptos(res.data)
        }, _err => {
            toast.error("Error with loading strategy crypto data, try later")
        })
    }, [])

    return (
        <div className="card" key={key}>
            <div className="name">
                <h1>{strategy.name}</h1>
            </div>
            <div className="info">
                <div className="data">
                    <div className="key">UrlId</div>
                    <div className="value">{strategy.urlId}
                    </div>
                </div>
                <div className="data">
                    <div className="key">Source</div>
                    <div className="value">{strategy.source}</div>
                </div>
                <div className="data">
                    <div className="key">Crypto</div>
                    <div className="value">
                        <div ref={inputRefs.crypto} className={edit ? "select" : ""}>
                            <Select
                                closeMenuOnSelect={false}
                                isDisabled={!edit}
                                components={animatedComponents}
                                defaultValue={() => strategy.crypto}
                                isMulti
                                options={cryptos}
                                onChange={(crypto) => setStrategy({...strategy, crypto: crypto})}
                            />
                        </div>
                    </div>
                </div>
                {(edit || ownAdd) &&
                    <div className="data">
                        <div className="key">Amount in $</div>
                        <div className="value">
                            <input ref={inputRefs.amount} defaultValue={strategy.amount} onChange={changeHandler} disabled={!edit} name="amount" type="number"/>
                        </div>
                    </div>
                }
                {(edit || ownAdd) &&
                <div className="data">
                    <div className="key">Leverage</div>
                    <div className="value">
                        <input ref={inputRefs.leverage} defaultValue={strategy.leverage} onChange={changeHandler} disabled={!edit} name="leverage" type="number"/>
                    </div>
                </div>
                }
                <div className="data">
                    <div className="key">Description</div>
                    <div className="value">{strategy.description}</div>
                </div>
            </div>
            {ownAdd && edit &&
                <div className="down">
                    <button onClick={() => onCloseEdit()}>Cancel</button>
                    <button onClick={() => onAdd("edit")} className="save">Save</button>
                </div>
            }
            {ownAdd && !edit &&
                <div className="down">
                    <svg onClick={() => onDelete()} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
                    <svg onClick={() => onEdit()} className="edit" width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>edit</title><path d="M200 360l150-150-80-80-150 150 80 80z m-140 60l110-30-80-80-30 110z m240-320l80 80 50-50-80-80-50 50z" /></svg>
                </div>
            }
            {!ownAdd && !edit &&
                <div className="down">
                    <svg onClick={() => onEdit()} className={"edit"} width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg"><title>plus</title><path d="M220 400l40 0 0-140 140 0 0-40-140 0 0-140-40 0 0 140-140 0 0 40 140 0 0 140z"/></svg>
                </div>
            }
            {!ownAdd && edit &&
                <div className="down">
                    <button onClick={() => onCloseEdit()}>Cancel</button>
                    <button onClick={() => onAdd("add")} className="save">Add</button>
                </div>
            }
        </div>
    )
}

export default StrategyCard;


import React, {useState, useRef, useEffect} from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import {logoutUser} from "../../redux/actions/user";

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
        setEdit(true)
    }

    const onDelete = (id) => {
        console.log('delete')
    }

    const onAdd = (path) => {
        axios.post(process.env.REACT_APP_SERVER + `/api/userStrategies/${path}`, {userStrategyId: strategy._id, crypto: strategy.crypto, amount: strategy.amount, leverage: strategy.leverage, strategyId: strategy._id},
            {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
                if (path === "add") {
                    onDeleting()
                    toast.success('Strategy successfully added!')
                } else {
                    toast.success('Strategy successfully edited!')
                    setEdit(false)
                }
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            } else if (err.response.data.errors) {
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
        axios.get(process.env.REACT_APP_SERVER + `/api/crypto/getAll?strategyId=${id}`,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setCryptos(res.data)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
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
                    <div className="key">Percentage</div>
                    <div className="value">{strategy.percentage}</div>
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


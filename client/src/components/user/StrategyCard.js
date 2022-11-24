import React, {useState, useRef, useEffect} from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {toast} from "react-toastify";
import {logoutUser} from "../../redux/actions/user";

function StrategyCard ({ data, key = null, own = false }) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [strategy, setStrategy] = useState(data)
    const [cryptos, setCryptos] = useState([])
    const [edit, setEdit] = useState(false)
    const [ownAdd, setOwnAdd] = useState(own)

    const inputRefs = {
        amount: useRef(),
        crypto: useRef()
    }

    const animatedComponents = makeAnimated();

    const changeHandler = (event) => {
        setStrategy({ ...strategy, [event.target.name]: event.target.value })
    }

    const onCloseEdit = () => {
        setEdit(false)
        console.log('close')
    }

    const onEdit = () => {
        setEdit(true)
        console.log('edit')
    }

    const onDelete = (id) => {
        console.log('delete')
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER + `/api/crypto/getAll?strategyId=${strategy._id}`,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            console.log(res.data)
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
                                defaultValue={() => strategy.crypto.map(arr => arr[0])}
                                isMulti
                                options={cryptos}
                                onChange={(crypto) => setStrategy({...strategy, crypto: crypto})}
                            />
                        </div>
                    </div>
                </div>
                {edit &&
                    <div className="data">
                        <div className="key">Amount in $</div>
                        <div className="value">
                            <input ref={inputRefs.amount} onChange={changeHandler} name="amount" type="number"/>
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
                    <button onClick={() => onEdit("edit")} className="save">Save</button>
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
                    <button onClick={() => onEdit("edit")} className="save">Add</button>
                </div>
            }
        </div>
    )
}

export default StrategyCard;


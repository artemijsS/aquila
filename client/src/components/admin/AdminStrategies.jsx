import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from "react-redux";
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import axios from "axios";
import {logoutUser} from "../../redux/actions/user";

function AdminStrategies () {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [strategies, setStrategies] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)
    const [newStrategyForm, setNewStrategyForm] = useState({
        urlId: '', name: '', description: '', percentage: '', source: '', rating: ''
    })
    const [newStrategy, setNewStrategy] = useState(false)

    const onPlus = () => {
        setNewStrategy(true)
    }

    const onEdit = (id) => {
        console.log("Edit " + id)
    }

    const onDelete = (id) => {
        console.log("Delete " + id)
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER + `/api/strategies/get?page=${page}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            console.log(res.data)
            setPage(Number(res.data.page))
            setPages(Number(res.data.pages))
            setStrategies(strategies.concat(res.data.strategies))
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
        })
    }, [page])

    const onCloseNew = () => {
        setNewStrategy(false)
    }

    const onSaveNew = () => {
        axios.post(process.env.REACT_APP_SERVER + "/api/strategies/new", newStrategyForm,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setStrategies(strategies.concat(res.data.strategy))
            setNewStrategy(false)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            if (err.response.data.errors) {
                toast.error("Please fill all required fields")
                let erArr = []
                err.response.data.errors.map(er => {
                    erArr.push(er.param)
                })
                let difference = Object.keys(newStrategyForm).filter(x => !erArr.includes(x));
                difference.map(id => {
                    document.getElementById(id)?.removeAttribute('style')
                })
                err.response.data.errors.map(er => {
                    document.getElementById(er.param).style.borderBottomColor = 'red'
                })
            }
            if (err.response.data.error === 1) {
                toast.warn("Strategy with this " + err.response.data.value + " already exists")
                document.getElementById(err.response.data.value).style.borderBottomColor = 'red'
                if (err.response.data.value === 'name') {
                    document.getElementById('urlId')?.removeAttribute('style')
                } else {
                    document.getElementById('name')?.removeAttribute('style')
                }
            }
        })
        console.log(newStrategyForm)
        // setNewStrategy(false)
    }

    const changeHandlerNew = event => {
        setNewStrategyForm({ ...newStrategyForm, [event.target.name]: event.target.value })
    }

    return (
        <div className="block">
            <div className="title">
                <h1>Strategies</h1>
            </div>
            <div className="search">
                <label><svg width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>search</title><path d="M220 370q26 0 48-8 23-8 42-22l80 80 30-30-80-80q14-19 22-42 8-22 8-48-1-65-43-107-42-42-107-43-64 1-106 43-42 42-44 107 2 64 44 106 42 42 106 44l0 0z m-110-150q1-48 32-78 30-31 78-32 48 1 78 32 31 30 32 78-1 48-32 78-30 31-78 32-48-1-78-32-31-30-32-78l0 0z" /></svg>
                </label>
                <input type="text" placeholder="Search"/>
                <svg onClick={() => onPlus()} className={pages ? "plus" : "plus pulse"} width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>plus</title><path d="M220 400l40 0 0-140 140 0 0-40-140 0 0-140-40 0 0 140-140 0 0 40 140 0 0 140z" /></svg>
            </div>
            <div className="cards">
                {newStrategy &&
                    <div className="card">
                        <div className="name">
                            <h1><input id="name" onChange={changeHandlerNew} name="name" type="text" placeholder="Name"/></h1>
                        </div>
                        <div className="info">
                            <div className="data">
                                <div className="key">UrlId</div>
                                <div className="value"><input id="urlId" onChange={changeHandlerNew} name="urlId" type="text"/></div>
                            </div>
                            <div className="data">
                                <div className="key">Source</div>
                                <div className="value"><input id="source" onChange={changeHandlerNew} name="source" type="text"/></div>
                            </div>
                            <div className="data">
                                <div className="key">Percentage</div>
                                <div className="value"><input id="percentage" onChange={changeHandlerNew} name="percentage" type="text"/></div>
                            </div>
                            <div className="data">
                                <div className="key">Description</div>
                                <div className="value"><textarea id="description" onChange={changeHandlerNew} name="description" /></div>
                            </div>
                        </div>
                        <div className="down">
                            <button onClick={() => onCloseNew()}>Close</button>
                            <button onClick={() => onSaveNew()} className="save">Save</button>
                        </div>
                    </div>
                }

                {pages === 0 && !newStrategy &&
                    <div className="card">
                        <blockquote className="blockquote"><p>what is not there is not</p></blockquote>
                    </div>
                }

                {pages !== 0 && !newStrategy &&
                    strategies.map((strategy, i) =>
                        <div className="card" key={i+strategy.name}>
                            <div className="name">
                                <h1>{strategy.name}</h1>
                            </div>
                            <div className="info">
                                <div className="data">
                                    <div className="key">UrlId</div>
                                    <div className="value">{strategy.urlId}</div>
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
                                    <div className="key">Description</div>
                                    <div className="value">{strategy.description}</div>
                                </div>
                            </div>
                            <div className="down">
                                <svg onClick={() => onEdit(i)} className="edit" width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>edit</title><path d="M200 360l150-150-80-80-150 150 80 80z m-140 60l110-30-80-80-30 110z m240-320l80 80 50-50-80-80-50 50z" /></svg>
                                <svg onClick={() => onDelete(i)} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
                            </div>
                        </div>
                    )

                }
            </div>
            <div className="down">
                <div className="load-more">
                    <button onClick={() => {setPage(page+1)}} disabled={page+1 === pages}>Load more</button>
                </div>
            </div>
        </div>
    )
}

export default AdminStrategies;


import React, { useEffect, useState } from 'react'
import { Signal } from '../index'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { useSelector } from "react-redux";
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import { httpGet, httpPost } from "../../utils/http"

function SignalBlock () {

    const animatedComponents = makeAnimated();

    const [signals, setSignals] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)

    const [cryptos, setCryptos] = useState([])

    const [search, setSearch] = useState({
        cryptos: [],
        search: '',
        sort: '',
        position: ''
    })

    const [updateData, setUpdateData] = useState({
        search: {
            cryptos: [],
            search: '',
            sort: '',
            position: ''
        },
        page: 0
    })

    const onSearchChange = (e) => {
        console.log(e.target.value)
    }

    const loadSignals = async () => {
        httpPost(`/api/signals/actions/get?page=${updateData.page}`, updateData.search).then(res => {
            // setUpdateData({...updateData, page: res.data.page})
            setPages(res.data.pages)
            setSignals(signals.concat(res.data.data))
        }, _err => {
            toast.error("Error with loading signals")
        })
    }

    const loadCryptos = async () => {
        httpGet(`/api/crypto/getAll`).then(res => {
            setCryptos(res.data)
        }, _err => {
            setCryptos([{value: "error", lavel: "error"}])
        })
    }

    const loadAllData = async () => {
        return await Promise.all([loadCryptos(), loadSignals()])
    }

    useEffect(() => {
        // loadAllData(search)
        loadCryptos()
    }, [])

    useEffect(() => {
        // loadAllData(search)
        loadSignals()
    }, [updateData])

    return (
        <div className="block">
            <div className="title">
                <h1>Signals</h1>
            </div>
            <div className="search">
                <label><svg width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>search</title><path d="M220 370q26 0 48-8 23-8 42-22l80 80 30-30-80-80q14-19 22-42 8-22 8-48-1-65-43-107-42-42-107-43-64 1-106 43-42 42-44 107 2 64 44 106 42 42 106 44l0 0z m-110-150q1-48 32-78 30-31 78-32 48 1 78 32 31 30 32 78-1 48-32 78-30 31-78 32-48-1-78-32-31-30-32-78l0 0z" /></svg>
                </label>
                <input type="text" placeholder="Search by strategy" onChange={e => setUpdateData({...updateData, search: {...updateData.search, search: e.target.value}})}/>
                <div className="selects">
                    <Select
                        placeholder= 'Sort by'
                        closeMenuOnSelect={true}
                        isClearable={true}
                        components={animatedComponents}
                        options={[{value: "profit", label: "profit"},{value: "amount", label: "amount"}]}
                        onChange={(sort) => setUpdateData({...updateData, search: {...updateData.search, sort: sort ? sort.value : ""}})}
                    />
                    <Select
                        placeholder= 'Side'
                        closeMenuOnSelect={true}
                        isClearable={true}
                        components={animatedComponents}
                        options={[{value: "LONG", label: "LONG"},{value: "SHORT", label: "SHORT"}]}
                        onChange={(side) => setUpdateData({...updateData, search: {...updateData.search, position: side ? side.value : ""}})}
                    />
                    <Select
                        placeholder= 'Crypto'
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        options={cryptos}
                        onChange={(crypto) => setUpdateData({...updateData, search: {...updateData.search, cryptos: crypto.map(cr => cr.label)}})}
                    />
                </div>
            </div>
            <div className={"cards list"}>
                {signals.map((signal) =>
                    <Signal signal={signal} key={signal._id}/>
                )}
                {signals.length === 0 &&
                <div className={"card signal"}>
                    <blockquote className="blockquote"><p>what is not there is not</p></blockquote>
                </div>
                }
            </div>
            <div className="down">
                <div className="load-more">
                    <button disabled={updateData.page + 1 >= pages} onClick={() => setUpdateData({ ...updateData, page: updateData.page + 1 })}>Load more</button>
                </div>
            </div>
        </div>
    )
}

export default SignalBlock;


import React, { useEffect, useState, useRef } from 'react'
import {useDispatch, useSelector} from "react-redux";
import ContentLoader, {List} from "react-content-loader"
import { toast } from "react-toastify";
import axios from "axios";
import { logoutUser } from "../../redux/actions/user";
import { Search } from "../index";

function Block ({title, objectForm, urlPath, children, newElement = true, list = false, update = false, updatePath = null, getAllInputPath = null, own = false}) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)

    const [allInputData, setAllInputData] = useState([])

    const [search, setSearch] = useState('')

    const [newDataCard, setNewDataCard] = useState(false)
    const [loading, setLoading] = useState(false)

    const onCreate = () => {
        setNewDataCard(true)
    }

    const onCloseCreate = () => {
        setNewDataCard(false)
    }

    const onAddNew = (obj) => {
        setData([])
        loadData(0, search, true)
    }

    const onDeleting = (id) => {
        setData([])
        loadData(0, search, true)
    }

    const onSearchChange = (text) => {
        setData([])
        setSearch(text)
        loadData(0, text, true)
    }

    const onUpdateData = () => {
        setLoading(true)
        axios.post(process.env.REACT_APP_SERVER + `/api/${urlPath}/${updatePath}`, {},{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setData([])
            loadData(0, search, true)
            toast.success(res.data)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            toast.error("Error, try later")
            setLoading(false)
        })
    }

    const loadDataConcurrently = async ()  => {
        return await Promise.all([loadData(page, search), getAllInputData()])
    }

    const getAllInputData = () => {
        setLoading(true)
        axios.get(process.env.REACT_APP_SERVER + `/api/${getAllInputPath}/getAll`,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setAllInputData(res.data)
            setLoading(false)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            toast.error("Error with loading all " + title + " data, try later")
            setLoading(false)
        })
    }

    useEffect(() => {
        setLoading(true)
        if (title === "Strategies" || title === "Add new strategy") {
            loadDataConcurrently()
        } else {
            loadData(page, search)
        }
    }, [])

    const loadData = (page, search, reset = false) => {
        setLoading(true)
        axios.get(process.env.REACT_APP_SERVER + `/api/${urlPath}/get?page=${page}&search=${search}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setPage(Number(res.data.page))
            setPages(Number(res.data.pages))
            if (reset)
                setData(res.data.data)
            else
                setData(data.concat(res.data.data))
            console.log(res.data)
            setLoading(false)
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
            setLoading(false)
        })
    }

    return (
        <div className="block">
            <div className="title">
                <h1>{title}</h1>
            </div>
            <Search data={data} onCreate={onCreate} newData={newDataCard} newElement={newElement} update={update} onUpdateData={onUpdateData} onSearchChange={onSearchChange}/>
            <div className={list ? "cards list" : "cards"}>
                {loading &&
                <ContentLoader width={"100%"} className={"card"}>
                    <rect x="0" y="0" rx="10" ry="10" width="5000px" height="100%" />
                </ContentLoader>
                }

                {newDataCard &&
                    React.cloneElement(children, { data: objectForm, editable: true, close: onCloseCreate, addNew: onAddNew, allInputData: allInputData })
                }

                {!newDataCard && !loading && data.length === 0 &&
                <div className="card">
                    <blockquote className="blockquote"><p>what is not there is not</p></blockquote>
                </div>
                }

                {pages !== 0 && !newDataCard && !loading &&
                    data.map((obj, index) =>
                        React.cloneElement(children, { data: obj, key: index, onDeleting:onDeleting, allInputData: allInputData, own: own })
                    )
                }
            </div>
            <div className="down">
                <div className="load-more">
                    <button onClick={() => {setPage(page+1); loadData(page + 1, search)}} disabled={page+1 >= pages}>Load more</button>
                </div>
            </div>
        </div>
    )
}

export default Block;


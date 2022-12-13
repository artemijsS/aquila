import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import { Search } from "../index";
import { httpGet, httpPost } from "../../utils/http"

function Block ({title, objectForm, urlPath, children, newElement = true, list = false, update = false, updatePath = null, getAllInputPath = null, own = false}) {

    const { updateAllStrategies, updateMyStrategies } = useSelector(({ updates }) => updates);

    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)

    const [allInputData, setAllInputData] = useState([])

    const [search, setSearch] = useState('')

    const [newDataCard, setNewDataCard] = useState(false)
    const [loading, setLoading] = useState(true)

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
        httpPost(`/api/${urlPath}/${updatePath}`, {}).then(res => {
            setData([])
            loadData(0, search, true)
            toast.success(res.data)
        }, _err => {
            toast.error("Error, try later")
            setLoading(false)
        })
    }

    const loadDataConcurrently = async ()  => {
        return await Promise.all([loadData(page, search), getAllInputData()])
    }

    const getAllInputData = () => {
        setLoading(true)
        httpGet(`/api/${getAllInputPath}/getAll`).then(res => {
            setAllInputData(res.data)
            setLoading(false)
        }, _err => {
            toast.error("Error with loading all " + title + " data, try later")
            setLoading(false)
        })
    }

    useEffect(() => {
        setLoading(true)
        if (title === "Strategies" || title === "Add new strategy" || title === "My strategies") {
            loadDataConcurrently()
        } else {
            loadData(page, search)
        }
    }, [])

    useEffect(() => {
        if (title === "Add new strategy") {
            setLoading(true)
            loadData(0, search, true)
        }
    }, [updateAllStrategies])

    useEffect(() => {
        if (title === "My strategies") {
            setLoading(true)
            loadData(0, search, true)
        }
    }, [updateMyStrategies])

    const loadData = (page, search, reset = false) => {
        setLoading(true)
        httpGet(`/api/${urlPath}/get?page=${page}&search=${search}`).then(res => {
            setPage(Number(res.data.page))
            setPages(Number(res.data.pages))
            if (reset)
                setData(res.data.data)
            else
                setData(data.concat(res.data.data))
            console.log(res.data)
            setLoading(false)
        }, _err => {
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

                {newDataCard && !loading &&
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


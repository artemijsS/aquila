import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from "react-redux";
import ContentLoader, {List} from "react-content-loader"
import { toast } from "react-toastify";
import axios from "axios";
import { logoutUser } from "../../redux/actions/user";
import { Search } from "../index";

function Block ({title, objectForm, urlPath, children, newElement = true, list = false}) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)

    const [search, setSearch] = useState('')

    const [delAdd, setDelAdd] = useState(0)

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
        page ? setPage(0) : setDelAdd(delAdd+1)
    }

    const onDeleting = (id) => {
        setData([])
        page ? setPage(0) : setDelAdd(delAdd+1)
    }

    const onSearchChange = (text) => {
        setData([])
        setSearch(text)
    }

    useEffect(() => {
        setLoading(true)
        let crPage = page
        if (search)
            crPage = 0
        axios.get(process.env.REACT_APP_SERVER + `/api/${urlPath}/get?page=${crPage}&search=${search}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setPage(Number(res.data.page))
            setPages(Number(res.data.pages))
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
    }, [page, delAdd, search])

    return (
        <div className="block">
            <div className="title">
                <h1>{title}</h1>
            </div>
            <Search data={data} onCreate={onCreate} newData={newDataCard} newElement={newElement} onSearchChange={onSearchChange}/>
            <div className={list ? "cards list" : "cards"}>
                {loading &&
                <ContentLoader width={"100%"} className={"card"}>
                    <rect x="0" y="0" rx="10" ry="10" width="5000px" height="100%" />
                </ContentLoader>
                }

                {newDataCard &&
                    React.cloneElement(children, { data: objectForm, editable: true, close: onCloseCreate, addNew: onAddNew })
                }

                {!newDataCard && !loading && data.length === 0 &&
                <div className="card">
                    <blockquote className="blockquote"><p>what is not there is not</p></blockquote>
                </div>
                }

                {pages !== 0 && !newDataCard && !loading &&
                    data.map((obj, index) =>
                        React.cloneElement(children, { data: obj, key: index, onDeleting:onDeleting })
                    )
                }
            </div>
            <div className="down">
                <div className="load-more">
                    <button onClick={() => {setPage(page+1)}} disabled={page+1 >= pages}>Load more</button>
                </div>
            </div>
        </div>
    )
}

export default Block;


import React, { useEffect, useState } from 'react'
import {useDispatch, useSelector} from "react-redux";
import ContentLoader from "react-content-loader"
import { toast } from "react-toastify";
import axios from "axios";
import { logoutUser } from "../../redux/actions/user";
import { Search } from "../index";

function Block ({title, objectForm, urlPath, children}) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [data, setData] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)

    const [newDataCard, setNewDataCard] = useState(false)

    const onCreate = () => {
        setNewDataCard(true)
    }

    const onCloseCreate = () => {
        setNewDataCard(false)
    }

    const onAddNew = (obj) => {
        if (page+1 === pages || data.length === 0) {
            setData(data.concat(obj))
        }
    }

    const onDeleting = (id) => {
        let index = data.indexOf(id);
        if (index !== -1) {
            setData(data.splice(index,1))
        }
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER + `/api/${urlPath}/get?page=${page}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            setPage(Number(res.data.page))
            setPages(Number(res.data.pages))
            setData(data.concat(res.data.data))
        }, err => {
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            }
        })
    }, [page])

    return (
        <div className="block">
            <div className="title">
                <h1>{title}</h1>
            </div>
            <Search data={data} onCreate={onCreate} newData={newDataCard}/>
            <div className="cards">
                {newDataCard &&
                    React.cloneElement(children, { strategy: objectForm, editable: true, close: onCloseCreate, addNew: onAddNew })
                }

                {pages === 0 && !newDataCard &&
                <div className="card">
                    <blockquote className="blockquote"><p>what is not there is not</p></blockquote>
                </div>
                }

                {pages !== 0 && !newDataCard &&
                    data.map((obj, index) =>
                        React.cloneElement(children, { strategy: obj, key: index, onDeleting:onDeleting })
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

export default Block;


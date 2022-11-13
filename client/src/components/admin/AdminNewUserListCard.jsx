import React, { useState, useRef } from 'react'
import axios from "axios";
import {toast} from "react-toastify";
import {logoutUser} from "../../redux/actions/user";
import {useDispatch, useSelector} from "react-redux";

function AdminUserCard ({ data, editable = false, addNew = null, onDeleting = null, key = null, close = null }) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [editError, setEditError] = useState(false)
    const cardRef = useRef()
    const input = useRef()

    const [edit, setEdit] = useState(editable)
    const [dataForm, setDataForm] = useState(data)

    const changeHandler = (event) => {
        setDataForm({...dataForm, [event.target.name]: event.target.value})
    }

    const onSave = () => {
        axios.post(process.env.REACT_APP_SERVER + "/api/userNew/new", dataForm,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            toast.success("New user access saved")
            addNew(res.data.newUser)
            close()
        }, err => {
            setEditError(true)
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            } else if (err.response.data.errors) {
                toast.error("Please fill telegram username")
                input.current.classList.add('red')
            } else if (err.response.data.error === 1) {
                toast.warn("User with this username already registered")
                input.current.classList.add('red')
            } else if (err.response.data.error === 2) {
                toast.warn("User access already given to this username")
                input.current.classList.add('red')
            } else {
                toast.error("Error, try one more time")
            }
        })
    }

    const onDelete = (id) => {
        loading(true)
        if (window.confirm('Are you sure you want to delete ' + data.telegram_username + '?')) {
            axios.delete(process.env.REACT_APP_SERVER + `/api/userNew/delete?telegram_username=${data.telegram_username}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(_res => {
                toast.success("User " + data.telegram_username + " deleted")
                onDeleting(data)
                cardRef.current.classList.add('delete')
            }, err => {
                if (err.response.status === 401) {
                    toast.warn("Authorization period expired")
                    dispatch(logoutUser())
                }
                toast.error("Error, try one more time")
                loading(false)
            })
        } else {
            loading(false)
        }
    }

    const onCloseCreate = () => {
        close()
    }

    const loading = (toggle) => {
        if (toggle)
            cardRef.current.classList.add('pulse')
        else
            cardRef.current.classList.remove('pulse')
    }

    return (
        <div ref={cardRef} className={editable ? "card editable" : "card"} key={key}>
            <div className="name">
                <h1>
                    {edit ?
                        <input ref={input} defaultValue={dataForm.telegram_username} onChange={changeHandler} name="telegram_username" type="text"/>
                        :
                        dataForm.telegram_username
                    }
                </h1>
            </div>
            {edit ?
                <div className="down">
                    <button onClick={() => onCloseCreate()}>Cancel</button>
                    <button onClick={() => onSave()} className="save">Save</button>
                </div>
                :
                <div className="down">
                    <svg onClick={() => onDelete()} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
                </div>
            }
        </div>
    )
}

export default AdminUserCard;


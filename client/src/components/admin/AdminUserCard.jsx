import React, { useState, useRef } from 'react'
import axios from "axios";
import {toast} from "react-toastify";
import {logoutUser} from "../../redux/actions/user";
import {useDispatch, useSelector} from "react-redux";

function AdminUserCard ({ data, onDeleting = null, key = null }) {

    const dispatch = useDispatch()

    const { userData } = useSelector(({ user }) => user);

    const [editError, setEditError] = useState(false)
    const cardRef = useRef()

    const [edit, setEdit] = useState(false)
    const [dataForm, setDataForm] = useState(data)

    const changeHandler = (event) => {
        if (event.target.name === "disabled") {
            setDataForm({ ...dataForm, disabled: !dataForm.disabled })
        } else if (event.target.name === "twoFAuthentication") {
            setDataForm({...dataForm, twoFAuthentication: !dataForm.twoFAuthentication})
        } else {
            setDataForm({...dataForm, [event.target.name]: event.target.value})
        }
    }

    const onSave = () => {
        console.log(dataForm)
        axios.post(process.env.REACT_APP_SERVER + "/api/user/adminEdit", dataForm,{headers: {authorization: `Bearer ${userData.token}`}}).then(res => {
            toast.success("User edited")
            console.log(res.data.user)
            setDataForm(res.data.user)
            onCloseEdit()
        }, err => {
            setEditError(true)
            if (err.response.status === 401) {
                toast.warn("Authorization period expired")
                dispatch(logoutUser())
            } else if (err.response.data.errors) {
                toast.error("Please fill all required fields")
            } else if (err.response.data.error === 1) {
                toast.warn("User with this " + err.response.data.value + " already exists")
            } else if (err.response.data.error === 2) {
                toast.error("Error with " + err.response.data.value)
            } else {
                toast.error("Error, try one more time")
            }
        })
    }

    const onDelete = (id) => {
        loading(true)
        if (window.confirm('Are you sure you want to delete ' + id + '?')) {
            axios.delete(process.env.REACT_APP_SERVER + `/api/user/delete?telegram_username=${id}`, {headers: {authorization: `Bearer ${userData.token}`}}).then(_res => {
                toast.success("User " + id + " deleted")
                onDeleting(id)
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

    const onEdit = () => {
        setEdit(true)
    }

    const onCloseEdit = () => {
        if (editError)
            setDataForm(data)
        setEdit(false)
        setEditError(false)
    }

    const loading = (toggle) => {
        if (toggle)
            cardRef.current.classList.add('pulse')
        else
            cardRef.current.classList.remove('pulse')
    }

    return (
        <div ref={cardRef} className="card" key={key}>
            <div className="name">
                <h1>{dataForm.telegram_username}</h1>
            </div>
            <div className="info">
                <div className="data">
                    <div className="key">Telegram chatId</div>
                    <div className="value">{dataForm.telegram_chatId}</div>
                </div>
                <div className="data">
                    <div className="key">Role</div>
                    <div className="value">
                        {edit ?
                            <select name="role" defaultValue={dataForm.role}>
                                <option value="admin">admin</option>
                                <option value="user">user</option>
                            </select>
                            :
                            dataForm.role
                        }
                    </div>
                </div>
                <div className="data">
                    <div className="key">twoFAuthentication</div>
                    <div className="value">
                        <div className="toggle-pill-color">
                            <input disabled={!edit} type="checkbox" id={"pill2fa" + dataForm.telegram_username} name="twoFAuthentication" onChange={changeHandler} defaultChecked={dataForm.twoFAuthentication}/>
                            <label htmlFor={"pill2fa" + dataForm.telegram_username}/>
                        </div>
                    </div>
                </div>
                <div className="data">
                    <div className="key">disabled</div>
                    <div className="value">
                        <div className="toggle-pill-color">
                            <input disabled={!edit} type="checkbox" id={"pillDis" + dataForm.telegram_username} name="disabled" onChange={changeHandler} defaultChecked={dataForm.disabled}/>
                            <label htmlFor={"pillDis" + dataForm.telegram_username}/>
                        </div>
                    </div>
                </div>
                <div className="data">
                    <div className="key">Description</div>
                    <div className="value">
                        {edit ?
                            <textarea defaultValue={dataForm.description} onChange={changeHandler} name="description" />
                            :
                            dataForm.description
                        }
                    </div>
                </div>
            </div>
            {edit ?
                <div className="down">
                    <button onClick={() => onCloseEdit()}>Cancel</button>
                    <button onClick={() => onSave()} className="save">Save</button>
                </div>
                :
                <div className="down">
                    <svg onClick={() => onEdit()} className="edit" width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>edit</title><path d="M200 360l150-150-80-80-150 150 80 80z m-140 60l110-30-80-80-30 110z m240-320l80 80 50-50-80-80-50 50z" /></svg>
                    <svg onClick={() => onDelete(data.telegram_username)} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
                </div>
            }
        </div>
    )
}

export default AdminUserCard;


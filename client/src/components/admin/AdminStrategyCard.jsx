import React, { useState, useRef } from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { toast } from "react-toastify";
import { httpPost, httpDelete } from "../../utils/http"

function AdminStrategyCard ({ data, allInputData, editable = false, close = null, addNew = null, onDeleting = null, key = null }) {

    const [editError, setEditError] = useState(false)
    const cardRef = useRef()
    const inputRefs = {
        name: useRef(),
        urlId: useRef(),
        source: useRef(),
        crypto: useRef(),
        description: useRef()
    }

    const [edit, setEdit] = useState(editable)
    const [dataForm, setDataForm] = useState(data)
    const [cryptos, setCryptos] = useState(allInputData)
    const animatedComponents = makeAnimated();

    const changeHandler = (event) => {
        setDataForm({ ...dataForm, [event.target.name]: event.target.value })
    }

    const onSave = (path) => {
        httpPost("/api/strategies/" + path, dataForm).then(res => {
            if (path === "new") {
                toast.success("New strategy added")
                addNew(res.data.strategy)
                close()
            } else if ("edit") {
                toast.success("Strategy edited")
                setDataForm(res.data.strategy)
                onCloseEdit()
            }
        }, err => {
            if (path === "edit") {
                setEditError(true)
            }
            if (err.response.data.errors) {
                toast.error("Please fill all required fields")
                Object.keys(inputRefs).forEach(key => {
                    if (!(!editable && (key === "name" || key === "urlId")))
                        inputRefs[key].current.classList.remove('red')
                })
                err.response.data.errors.forEach(er =>
                    inputRefs[er.param].current.classList.add('red')
                )
            } else if (err.response.data.error === 1) {
                toast.warn("Strategy with this " + err.response.data.value + " already exists")
                Object.keys(inputRefs).forEach(key => {
                    inputRefs[key].current.classList.remove('red')
                })
                inputRefs['urlId'].current.classList.remove('red')
                inputRefs['name'].current.classList.remove('red')
                inputRefs[err.response.data.value].current.classList.add('red')
            } else if (err.response.data.error === 2) {
                toast.warn("There is problem with crypto...")
                inputRefs[err.response.data.value].current.classList.add('red')
            } else {
                toast.error("Error, try one more time")
            }
        })
    }

    const onDelete = (name) => {
        loading(true)
        if (window.confirm('Are you sure you want to delete ' + name + '?')) {
            httpDelete(`/api/strategies/delete?name=${name}`).then(_res => {
                toast.success("Strategy " + name + " deleted")
                onDeleting(name)
                cardRef.current.classList.add('delete')
            }, _err => {
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
        <div ref={cardRef} className="card relative" key={key}>
            <div className="cubes">
                <span className={"cube profit plus"} title="global count of triggers">{dataForm.workedTimes}</span>
                <span className={"cube leverage LONG"} title="global win rate">{dataForm.percentOfWins}%</span>
            </div>
            <div className="name">
                <h1>
                    {editable ?
                        <input ref={inputRefs.name} defaultValue={dataForm.name} onChange={changeHandler} name="name" type="text"/>
                        :
                        dataForm.name
                    }
                </h1>
            </div>
            <div className="info">
                <div className="data">
                    <div className="key">UrlId</div>
                    <div className="value">
                        {edit ?
                            <input ref={inputRefs.urlId} defaultValue={dataForm.urlId} onChange={changeHandler} name="urlId" type="text"/>
                            :
                            dataForm.urlId
                        }
                    </div>
                </div>
                <div className="data">
                    <div className="key">Source</div>
                    <div className="value">
                        {edit ?
                            <input ref={inputRefs.source} defaultValue={dataForm.source} onChange={changeHandler} name="source" type="text"/>
                            :
                            dataForm.source
                        }
                    </div>
                </div>
                <div className="data">
                    <div className="key">Crypto</div>
                    <div className="value">
                        <div ref={inputRefs.crypto} className={edit ? "select" : ""}>
                            <Select
                                closeMenuOnSelect={false}
                                isDisabled={!edit}
                                components={animatedComponents}
                                defaultValue={dataForm.crypto}
                                isMulti
                                options={cryptos}
                                onChange={(crypto) => setDataForm({...dataForm, crypto: crypto})}
                            />
                        </div>
                    </div>
                </div>
                <div className="data">
                    <div className="key">Description</div>
                    <div className="value">
                        {edit ?
                            <textarea ref={inputRefs.description} defaultValue={dataForm.description} onChange={changeHandler} name="description" />
                            :
                            dataForm.description
                        }
                    </div>
                </div>
            </div>
            {edit ?
                <div className="down">
                    <button onClick={editable ? () => onCloseCreate() : () => onCloseEdit()}>Cancel</button>
                    <button onClick={editable ? () => onSave("new") : () => onSave("edit")} className="save">Save</button>
                </div>
                :
                <div className="down">
                    <svg onClick={() => onEdit()} className="edit" width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>edit</title><path d="M200 360l150-150-80-80-150 150 80 80z m-140 60l110-30-80-80-30 110z m240-320l80 80 50-50-80-80-50 50z" /></svg>
                    <svg onClick={() => onDelete(dataForm.name)} className="delete" width="30" height="30" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" ><title>delete</title><path d="M100 400l200 0q8 0 14-6 6-6 6-14l0-200 40 0 0-40-80 0 0-40q0-8-6-14-6-6-14-6l-120 0q-8 0-14 6-6 6-6 14l0 40-80 0 0 40 40 0 0 200q0 8 6 14 6 6 14 6l0 0z m20-40l0-160 60 0 0 160-60 0z m40-200l0-40 80 0 0 40-80 0z m60 200l0-160 60 0 0 160-60 0z" /></svg>
                </div>
            }
        </div>
    )
}

export default AdminStrategyCard;


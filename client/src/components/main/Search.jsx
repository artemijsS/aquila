import React from 'react'

function Search ({ data, onCreate, onSearchChange, newData, onUpdateData = null, newElement = true, update = false }) {

    const onPlus = () => {
        onCreate()
    }

    const onChange = (e) => {
        onSearchChange(e.target.value)
    }

    const onUpdate = (e) => {
        onUpdateData()
    }

    return (
        <div className="search">
            <label><svg width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>search</title><path d="M220 370q26 0 48-8 23-8 42-22l80 80 30-30-80-80q14-19 22-42 8-22 8-48-1-65-43-107-42-42-107-43-64 1-106 43-42 42-44 107 2 64 44 106 42 42 106 44l0 0z m-110-150q1-48 32-78 30-31 78-32 48 1 78 32 31 30 32 78-1 48-32 78-30 31-78 32-48-1-78-32-31-30-32-78l0 0z" /></svg>
            </label>
            <input type="text" placeholder="Search" disabled={newData} onChange={e => onChange(e)}/>
            <div style={{display: update ? 'block' : 'none' }} className="update"><button onClick={() => onUpdate()} className="save">Update</button></div>
            <svg style={{display: newElement ? 'block' : 'none' }} onClick={() => onPlus()} className={data.length !== 0 ? "plus" : "plus pulse"} width="30" height="30" viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" ><title>plus</title><path d="M220 400l40 0 0-140 140 0 0-40-140 0 0-140-40 0 0 140-140 0 0 40 140 0 0 140z" /></svg>
        </div>
    )
}

export default Search;


import React, { useState, useRef } from 'react'

function AdminCryptoUserCard ({ data, key = null }) {


    const cardRef = useRef()

    const [dataForm, setDataForm] = useState(data)

    return (
        <div ref={cardRef} className={"card"} key={key}>
            <div className="name">
                <h1>{dataForm.name}</h1>
            </div>
            <div className="down">
                <h1>quantityPrecision: {dataForm.quantityPrecision}</h1>
            </div>
        </div>
    )
}

export default AdminCryptoUserCard;


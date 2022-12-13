import React, {useState, useEffect} from 'react'
import { Legend, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import { httpGet } from "../../../utils/http";
import { toast } from "react-toastify";
import ContentLoader from "react-content-loader";
import Select from "react-select";



function ProfitChart ({ isStrategies }) {

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [diapason, setDiapason] = useState("day")

    useEffect(() => {
        setLoading(true)
        httpGet('/api/overview/getProfitChart?diapason=' + diapason).then(res => {
            setData(res.data)
            setLoading(false)
        }, _err => {
            toast.error("Error with loading profit chart")
        })
    }, [diapason])

    return (
        <div className="card fixed full">
            <div className="name">
                <h1>Profit Chart</h1>
            </div>
            <div className="search" style={{marginBottom: "30px"}}>
                <Select
                    placeholder= 'Sort by'
                    closeMenuOnSelect={true}
                    defaultValue={{value: "day", label: "day (month)"}}
                    options={[{value: "day", label: "day (month)"},{value: "year", label: "year"}]}
                    onChange={(diapason) => setDiapason(diapason ? diapason.value : "day")}
                />
            </div>
            <div className="info left" style={{ paddingBottom: "35px" }}>
                {loading &&
                    <ContentLoader width={"100%"} className={"card fixed full"} style={{ marginBottom: "20px" }}>
                        <rect x="0" y="0" rx="10" ry="10" width="5000px" height="100%" />
                    </ContentLoader>
                }
                {!loading &&
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            <Bar dataKey="count" barSize={20} fill="orange" name="Signals count" />
                            <Line type="monotone" dataKey="profit" stroke="green" dot={{ fill: 'green' }} name="Profit"/>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                        </ComposedChart>
                    </ResponsiveContainer>
                }
            </div>
        </div>
    )
}

export default ProfitChart;


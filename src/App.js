import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: '2011', uv: 4000, pv: 2400, amt: 2400 },
    { name: '2012', uv: 3000, pv: 1398, amt: 2210 },
    { name: '2013', uv: 2000, pv: 9800, amt: 2290 },
    { name: '2014', uv: 2780, pv: 3908, amt: 2000 },
    { name: '2015', uv: 1890, pv: 4800, amt: 2181 },
    { name: '2016', uv: 2390, pv: 3800, amt: 2500 },
    { name: '2017', uv: 3490, pv: 4300, amt: 2100 },
];

const App = () => {
    return (
        <ResponsiveContainer width="100%" height={400} >
            <LineChart style={{background:"black"}} data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#ffe600" strokeWidth={2} dot={{ stroke: 'white', strokeWidth: 2, fill: '#baa60c' }} activeDot={{ stroke: 'white', strokeWidth: 2, fill: '#ffe600', r: 8 }} />
                <Line type="monotone" dataKey="uv" stroke="#1dbf73" strokeWidth={2} dot={{ stroke: 'white', strokeWidth: 2, fill: '#1dbf73' }} activeDot={{ stroke: 'white', strokeWidth: 2, fill: '#1dbf73', r: 8 }} />
                <Line type="monotone" dataKey="amt" stroke="#0181ff" strokeWidth={2} dot={{ stroke: 'white', strokeWidth: 2, fill: '#0181ff' }} activeDot={{ stroke: 'white', strokeWidth: 2, fill: '#0181ff', r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default App;

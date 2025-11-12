import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartProps {
  data: {
    year: number;
    totalInvested: number;
    gains: number;
  }[];
}

const formatCurrency = (value: number, withDecimals = false) => {
    const options = {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: withDecimals ? 2 : 0,
        maximumFractionDigits: withDecimals ? 2 : 0,
    };
    return new Intl.NumberFormat('es-ES', options).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalInvested = payload[0].value;
    const gains = payload[1].value;
    const totalValue = totalInvested + gains;
    return (
      <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg text-white">
        <p className="label">{`Año: ${label}`}</p>
        <p style={{ color: payload[1].fill }}>{`Ganancias: ${formatCurrency(gains, true)}`}</p>
        <p style={{ color: payload[0].fill }}>{`Total Aportado: ${formatCurrency(totalInvested, true)}`}</p>
        <hr className="my-1 border-gray-500"/>
        <p className="font-bold">{`Valor Total: ${formatCurrency(totalValue, true)}`}</p>
      </div>
    );
  }
  return null;
};

const FuturePerformanceChart: React.FC<ChartProps> = ({ data }) => {
    // Calculate a dynamic interval to avoid overcrowding the X-axis for long periods
    const interval = data.length > 20 ? Math.floor(data.length / 10) : 0;

  return (
    <div className="w-full h-80 bg-gray-800 p-4 rounded-lg">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5, }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
              dataKey="year" 
              name="Año" 
              stroke="#A0AEC0" 
              tick={{ fontSize: 12 }}
              interval={interval}
          />
          <YAxis 
            stroke="#A0AEC0" 
            tickFormatter={(tick) => formatCurrency(tick)} 
            tick={{ fontSize: 12 }}
            />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36}/>
          <Area type="monotone" dataKey="totalInvested" name="Total Aportado" stackId="1" stroke="#3182CE" fill="#3182CE" />
          <Area type="monotone" dataKey="gains" name="Ganancias" stackId="1" stroke="#48BB78" fill="#48BB78" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FuturePerformanceChart;
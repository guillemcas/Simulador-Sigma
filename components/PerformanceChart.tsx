import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

const formatFundPrice = (value: number) => {
    // Using more decimal places for precision in tooltips and formatting
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg text-white">
        <p className="label">{`Fecha: ${label}`}</p>
        <p className="intro" style={{ color: payload[0].stroke }}>{`Precio: ${formatFundPrice(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};


const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    const interval = data.length > 30 ? Math.floor(data.length / 15) : 1; // More frequent labels

    const { paddedDomain } = useMemo(() => {
        if (data.length === 0) {
            return { paddedDomain: [0, 1] };
        }
        const yValues = data.map(p => p.valor);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        // Add a small padding to the domain to better visualize small fluctuations
        const padding = (yMax - yMin) * 0.05; // 5% padding on top and bottom

        // Handle case where all values are the same
        if (yMin === yMax) {
             return { paddedDomain: [yMin - (yMin * 0.01), yMax + (yMax * 0.01)] };
        }

        return { paddedDomain: [yMin - padding, yMax + padding] };
    }, [data]);


  return (
    <div className="w-full h-80 bg-gray-800 p-4 rounded-lg">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 30, // Increased bottom margin for rotated labels
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
              dataKey="date" 
              stroke="#A0AEC0" 
              tick={{ fontSize: 12, angle: -35, textAnchor: 'end' }} 
              interval={interval}
              height={50} // Give explicit height for the axis
          />
          <YAxis 
            stroke="#A0AEC0" 
            tickFormatter={(tick) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tick)} 
            tick={{ fontSize: 12 }} 
            domain={paddedDomain}
            allowDataOverflow={true}
            type="number"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36}/>
          <Line dataKey="valor" name="Precio del Fondo" stroke="#48BB78" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;

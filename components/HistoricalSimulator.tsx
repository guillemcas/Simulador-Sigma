import React, { useState, useMemo, useCallback } from 'react';
import { HistoricalDataPoint, SimulationResult } from '../types';
import PerformanceChart from './PerformanceChart';

interface HistoricalSimulatorProps {
    historicalData: HistoricalDataPoint[];
}

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const HistoricalSimulator: React.FC<HistoricalSimulatorProps> = ({ historicalData }) => {
    const { minDate, maxDate } = useMemo(() => {
        if (historicalData.length === 0) {
            return { minDate: new Date(), maxDate: new Date() };
        }
        return {
            minDate: historicalData[0].date,
            maxDate: historicalData[historicalData.length - 1].date,
        };
    }, [historicalData]);

    const [initialInvestment, setInitialInvestment] = useState<string>('10000');
    const [startDate, setStartDate] = useState<string>(() => formatDateForInput(minDate));
    const [endDate, setEndDate] = useState<string>(() => formatDateForInput(maxDate));
    
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleSetDatePreset = useCallback((preset: '1y' | '3y' | '5y' | 'ytd' | 'max') => {
        const newEndDate = new Date(maxDate);
        let newStartDate: Date;

        switch (preset) {
            case '1y':
                newStartDate = new Date(maxDate);
                newStartDate.setFullYear(newStartDate.getFullYear() - 1);
                break;
            case '3y':
                newStartDate = new Date(maxDate);
                newStartDate.setFullYear(newStartDate.getFullYear() - 3);
                break;
            case '5y':
                newStartDate = new Date(maxDate);
                newStartDate.setFullYear(newStartDate.getFullYear() - 5);
                break;
            case 'ytd':
                newStartDate = new Date(maxDate.getFullYear(), 0, 1);
                break;
            case 'max':
                newStartDate = new Date(minDate);
                break;
        }

        if (newStartDate < minDate) {
            newStartDate = new Date(minDate);
        }
        
        setStartDate(formatDateForInput(newStartDate));
        setEndDate(formatDateForInput(newEndDate));

    }, [minDate, maxDate]);

    const handleSimulate = useCallback(() => {
        setError('');
        setSimulationResult(null);

        const investment = parseFloat(initialInvestment);
        if (isNaN(investment) || investment <= 0) {
            setError('La inversión inicial debe ser un número positivo.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            setError('La fecha de inicio debe ser anterior a la fecha de fin.');
            return;
        }

        const startDataPoint = historicalData.find(p => p.date >= start);
        const endDataPoint = [...historicalData].reverse().find(p => p.date <= end);

        if (!startDataPoint || !endDataPoint) {
            setError('No se encontraron datos para el rango de fechas seleccionado. Por favor, ajuste las fechas.');
            return;
        }

        const filteredData = historicalData.filter(p => p.date >= startDataPoint.date && p.date <= endDataPoint.date);
        
        if (filteredData.length < 3) {
             setError('No hay suficientes datos para calcular métricas de riesgo (drawdown, volatilidad).');
            return;
        }

        // Daily returns for volatility calculation
        const dailyReturns: number[] = [];
        for (let i = 1; i < filteredData.length; i++) {
            const yesterdayPrice = filteredData[i - 1].value;
            const todayPrice = filteredData[i].value;
            dailyReturns.push((todayPrice / yesterdayPrice) - 1);
        }

        // Standard Deviation & Volatility
        const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
        // Bessel's correction (n-1) for sample standard deviation
        const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (dailyReturns.length - 1);
        const dailyStdDev = Math.sqrt(variance);
        const annualizedVolatility = dailyStdDev * Math.sqrt(252); // Assuming 252 trading days

        // Max Drawdown Calculation
        let peak = -Infinity;
        let maxDrawdown = 0;
        for (const dataPoint of filteredData) {
            const currentValue = dataPoint.value;
            if (currentValue > peak) {
                peak = currentValue;
            }
            const drawdown = (currentValue - peak) / peak;
            if (drawdown < maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        const startPrice = startDataPoint.value;
        const endPrice = endDataPoint.value;

        const numberOfShares = investment / startPrice;
        const finalValue = numberOfShares * endPrice;
        const netReturn = ((finalValue - investment) / investment) * 100;

        const chartData = filteredData.map(p => ({
            date: p.date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }),
            valor: p.value
        }));
            
        setSimulationResult({
            initialInvestment: investment,
            finalValue,
            netReturn,
            chartData,
            startDate: startDataPoint.date,
            endDate: endDataPoint.date,
            maxDrawdown,
            volatility: annualizedVolatility,
        });
    }, [initialInvestment, startDate, endDate, historicalData]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                    <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-300 mb-1">Inversión Inicial (€)</label>
                    <input
                        type="number"
                        id="initialInvestment"
                        value={initialInvestment}
                        onChange={(e) => setInitialInvestment(e.target.value)}
                        min="1"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 10000"
                    />
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Fecha de Inicio</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={formatDateForInput(minDate)}
                        max={formatDateForInput(maxDate)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">Fecha de Fin</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={formatDateForInput(minDate)}
                        max={formatDateForInput(maxDate)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => handleSetDatePreset('1y')} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">Último Año</button>
                <button onClick={() => handleSetDatePreset('3y')} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">3 Años</button>
                <button onClick={() => handleSetDatePreset('5y')} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">5 Años</button>
                <button onClick={() => handleSetDatePreset('ytd')} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">YTD</button>
                <button onClick={() => handleSetDatePreset('max')} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">Máx</button>
            </div>


            <div className="text-center">
                <button
                    onClick={handleSimulate}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
                >
                    Simular Rendimiento
                </button>
            </div>
            
            {error && <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

            {simulationResult ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm">Valor Final Estimado</h3>
                            <p className="text-2xl font-bold text-white">
                                {simulationResult.finalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                             <h3 className="text-gray-400 text-sm">Rendimiento Neto</h3>
                            <p className={`text-2xl font-bold ${simulationResult.netReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {simulationResult.netReturn.toFixed(2)}%
                            </p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm">Máximo Drawdown</h3>
                            <p className="text-2xl font-bold text-red-400">
                                {(simulationResult.maxDrawdown * 100).toFixed(2)}%
                            </p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm">Volatilidad (Anualizada)</h3>
                            <p className="text-2xl font-bold text-yellow-400">
                                {(simulationResult.volatility * 100).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">
                        Simulación de una inversión de <strong>{simulationResult.initialInvestment.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong> 
                        desde el <strong>{simulationResult.startDate.toLocaleDateString('es-ES')}</strong> hasta el <strong>{simulationResult.endDate.toLocaleDateString('es-ES')}</strong>.
                    </p>
                    <PerformanceChart data={simulationResult.chartData} />
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Introduzca los datos y haga clic en 'Simular' para ver los resultados.</p>
                </div>
            )}
        </div>
    );
};

export default HistoricalSimulator;

import React, { useState, useCallback } from 'react';
import { FutureSimulationResult, FutureBreakdownRow } from '../types';
import FuturePerformanceChart from './FuturePerformanceChart';

const FutureSimulator: React.FC = () => {
    const [initial, setInitial] = useState('1000');
    const [monthly, setMonthly] = useState('200');
    const [years, setYears] = useState('10');
    const [rate, setRate] = useState('7');
    
    const [result, setResult] = useState<FutureSimulationResult | null>(null);
    const [error, setError] = useState<string>('');

    const handleCalculate = useCallback(() => {
        setError('');
        setResult(null);

        const P = parseFloat(initial); // Initial
        const PMT = parseFloat(monthly); // Monthly
        const t = parseInt(years, 10); // Years
        const r_percent = parseFloat(rate); // Annual rate %

        if (isNaN(P) || P < 0 || isNaN(PMT) || PMT < 0 || isNaN(t) || t <= 0 || isNaN(r_percent)) {
            setError('Por favor, introduce valores numéricos válidos en todos los campos.');
            return;
        }

        const r = r_percent / 100; // Annual rate
        const n = 12; // Compounded monthly
        const num_months = t * n;

        const chartData: {year: number, totalInvested: number, gains: number}[] = [];
        const breakdownData: FutureBreakdownRow[] = [];

        chartData.push({ year: 0, totalInvested: P, gains: 0 });
        
        let current_balance = P;
        let previousYearEndBalance = P;

        for (let i = 1; i <= t; i++) { // Loop for each year
            const initialBalance = previousYearEndBalance;
            const annualContribution = PMT * 12;

            for(let j=1; j<=12; j++){
                current_balance = current_balance * (1 + r/n) + PMT;
            }

            const finalBalance = current_balance;
            const yearlyGains = finalBalance - initialBalance - annualContribution;
            
            breakdownData.push({
                year: i,
                initialBalance,
                annualContribution,
                yearlyGains,
                finalBalance
            });
            
            previousYearEndBalance = finalBalance;

            const totalInvested = P + (PMT * i * 12);
            const gains = current_balance - totalInvested;
            chartData.push({
                year: i,
                totalInvested: totalInvested,
                gains: gains,
            });
        }
        
        const finalValue = current_balance;
        const totalInvested = P + (PMT * num_months);
        const totalGains = finalValue - totalInvested;
        
        setResult({
            finalValue,
            totalInvested,
            totalGains,
            chartData,
            breakdown: breakdownData,
        });
    }, [initial, monthly, years, rate]);
    
    return (
        <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                    <label htmlFor="initial" className="block text-sm font-medium text-gray-300 mb-1">Aportación Inicial (€)</label>
                    <input
                        type="number"
                        id="initial"
                        value={initial}
                        onChange={(e) => setInitial(e.target.value)}
                        min="0"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 1000"
                    />
                </div>
                <div>
                    <label htmlFor="monthly" className="block text-sm font-medium text-gray-300 mb-1">Aportación Mensual (€)</label>
                    <input
                        type="number"
                        id="monthly"
                        value={monthly}
                        onChange={(e) => setMonthly(e.target.value)}
                        min="0"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 200"
                    />
                </div>
                <div>
                    <label htmlFor="years" className="block text-sm font-medium text-gray-300 mb-1">Duración (años)</label>
                    <input
                        type="number"
                        id="years"
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        min="1"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 10"
                    />
                </div>
                <div>
                    <label htmlFor="rate" className="block text-sm font-medium text-gray-300 mb-1">Retorno Anual Esperado (%)</label>
                    <input
                        type="number"
                        id="rate"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.1"
                        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 7"
                    />
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={handleCalculate}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
                >
                    Calcular
                </button>
            </div>

            {error && <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

            {result ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm">Total Aportado</h3>
                            <p className="text-2xl font-bold text-white">
                                {result.totalInvested.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <h3 className="text-gray-400 text-sm">Ganancias Totales</h3>
                            <p className="text-2xl font-bold text-green-400">
                                {result.totalGains.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg col-span-1 md:col-span-1">
                            <h3 className="text-gray-400 text-sm">Valor Final Estimado</h3>
                            <p className="text-2xl font-bold text-white">
                                {result.finalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                    </div>
                     <FuturePerformanceChart data={result.chartData} />

                    {result.breakdown && result.breakdown.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4 text-center">Desglose Anual</h3>
                            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Año</th>
                                            <th scope="col" className="px-6 py-3">Saldo Inicial</th>
                                            <th scope="col" className="px-6 py-3">Aportaciones Anuales</th>
                                            <th scope="col" className="px-6 py-3">Ganancias del Año</th>
                                            <th scope="col" className="px-6 py-3">Saldo Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.breakdown.map((row) => (
                                            <tr key={row.year} className="border-b border-gray-700 hover:bg-gray-600/50">
                                                <td className="px-6 py-4 font-medium text-white">{row.year}</td>
                                                <td className="px-6 py-4">{row.initialBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                                <td className="px-6 py-4">{row.annualContribution.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                                <td className="px-6 py-4 text-green-400">{row.yearlyGains.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                                <td className="px-6 py-4 font-bold">{row.finalBalance.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="text-center py-10 text-gray-500">
                    <p>Calcula el potencial de crecimiento de tu dinero a lo largo del tiempo.</p>
                </div>
            )}
        </div>
    );
};

export default FutureSimulator;
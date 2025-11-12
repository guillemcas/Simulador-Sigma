
import React, { useState, useMemo } from 'react';
import { csvData } from './data/historicalData';
import { parseCSV } from './utils/dataParser';
import { HistoricalDataPoint } from './types';
import HistoricalSimulator from './components/HistoricalSimulator';
import FutureSimulator from './components/FutureSimulator';

const App: React.FC = () => {
    const historicalData: HistoricalDataPoint[] = useMemo(() => parseCSV(csvData), []);
    const [activeTab, setActiveTab] = useState<'historical' | 'future'>('historical');

    const tabClasses = (tabName: 'historical' | 'future') =>
        `px-6 py-3 font-semibold rounded-t-lg transition-colors focus:outline-none ${
            activeTab === tabName
                ? 'bg-gray-800 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`;

    return (
        <div className="min-h-screen text-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto py-4">
                <header className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Simulador de Inversión</h1>
                    <p className="text-lg text-gray-400 mt-2">Fondo Sigma Internacional (ES0175902008)</p>
                     <p className="text-md text-gray-500 mt-4 max-w-3xl mx-auto">
                        Analiza el rendimiento histórico de una inversión o proyecta su crecimiento futuro. Utiliza datos reales para la simulación histórica y calcula el interés compuesto para tus planes a largo plazo.
                    </p>
                </header>
                
                <div>
                    <div className="flex border-b border-gray-700">
                        <button onClick={() => setActiveTab('historical')} className={tabClasses('historical')}>
                            Rendimiento Histórico
                        </button>
                        <button onClick={() => setActiveTab('future')} className={tabClasses('future')}>
                            Simulación a Futuro
                        </button>
                    </div>

                    <div className="bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-2xl p-6 md:p-8">
                        {activeTab === 'historical' ? (
                            <HistoricalSimulator historicalData={historicalData} />
                        ) : (
                            <FutureSimulator />
                        )}
                    </div>
                </div>
                <footer className="text-center mt-8 text-xs text-gray-500">
                    <p>Esta simulación es una herramienta educativa y no constituye asesoramiento financiero. Los rendimientos pasados no garantizan rendimientos futuros.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;

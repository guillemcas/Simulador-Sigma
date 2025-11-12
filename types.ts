
export interface HistoricalDataPoint {
  date: Date;
  value: number;
}

export interface ChartDataPoint {
  date: string;
  valor: number;
}

export interface SimulationResult {
  initialInvestment: number;
  finalValue: number;
  netReturn: number;
  chartData: ChartDataPoint[];
  startDate: Date;
  endDate: Date;
  maxDrawdown: number;
  volatility: number;
}

// New types for future simulation
export interface FutureChartDataPoint {
    year: number;
    totalInvested: number;
    gains: number;
}

export interface FutureBreakdownRow {
    year: number;
    initialBalance: number;
    annualContribution: number;
    yearlyGains: number;
    finalBalance: number;
}
  
export interface FutureSimulationResult {
    finalValue: number;
    totalInvested: number;
    totalGains: number;
    chartData: FutureChartDataPoint[];
    breakdown: FutureBreakdownRow[];
}

import { HistoricalDataPoint } from '../types';

/**
 * Parses a Spanish-style number string (e.g., "18,235") into a JavaScript float.
 * @param numStr The number string to parse.
 * @returns The parsed number.
 */
const parseSpanishNumber = (numStr: string): number => {
    // Handles numbers like "1.234,56" -> 1234.56 or "18,235" -> 18.235
    return parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
}

/**
 * Parses a date string in "dd.mm.yyyy" format into a Date object.
 * @param dateStr The date string to parse.
 * @returns The parsed Date object.
 */
const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('.');
    return new Date(`${year}-${month}-${day}T00:00:00Z`); // Use UTC to avoid timezone issues
}

/**
 * Parses the entire CSV string of historical fund data.
 * @param csv The raw CSV data string.
 * @returns An array of HistoricalDataPoint objects, sorted by date in ascending order.
 */
export const parseCSV = (csv: string): HistoricalDataPoint[] => {
    const lines = csv.trim().split('\n');
    const header = lines.shift(); 
    if (!header) return [];

    const data = lines
        .map(line => {
            // A line looks like: ""21.10.2025","18,235""
            // Remove the outer quotes and then split by the separator "," to handle the decimal comma correctly.
            const columns = line.slice(1, -1).split('","');
            if (columns.length < 2) return null;

            const dateStr = columns[0];
            const valueStr = columns[1];

            try {
                const date = parseDate(dateStr);
                const value = parseSpanishNumber(valueStr);
                
                if (isNaN(date.getTime()) || isNaN(value)) {
                    console.warn(`Skipping invalid line: ${line}`);
                    return null;
                }
                return { date, value };
            } catch (error) {
                console.error('Error parsing line:', line, error);
                return null;
            }
        })
        .filter((item): item is HistoricalDataPoint => item !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return data;
}

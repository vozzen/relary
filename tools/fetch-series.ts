#!/usr/bin/env node
/**
 * EVDS Series Data Fetcher
 * 
 * Standalone tool to fetch economic time series data from TCMB EVDS API
 * and save them as JSON files for use in the application.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createEVDSClient, FrequencyType, AggregationType } from '../src/shared/evds/index.js';

/**
 * Configuration from environment variables
 */
interface FetcherConfig {
  apiKey: string;
  seriesCodes: string[];
  startDate: Date;
  outputDir: string;
}

/**
 * Time series data point
 */
interface TimeSeriesItem {
  date: string;
  value: string | null;
}

/**
 * Series data structure
 */
interface SeriesData {
  code: string;
  items: TimeSeriesItem[];
}

/**
 * Combined series structure
 */
interface CombinedSeries {
  timestamp: string;
  series: SeriesData[];
}

/**
 * Converts API value to string, filtering out NaN values
 */
function convertValueToString(value: number | null | undefined): string | null {
  // If value is null or undefined, return null
  if (value === null || value === undefined) {
    return null;
  }
  
  // If value is NaN, return null instead of "NaN"
  if (Number.isNaN(value)) {
    return null;
  }
  
  // Convert valid number to string
  return String(value);
}

/**
 * Filter out items with null values
 */
function filterNullValues(items: TimeSeriesItem[]): Array<{ date: string; value: string }> {
  return items.filter((item): item is { date: string; value: string } => item.value !== null);
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): FetcherConfig {
  const apiKey = process.env.EVDS_API_KEY;
  if (!apiKey) {
    throw new Error('EVDS_API_KEY environment variable is required');
  }

  const seriesCodesStr = process.env.EVDS_SERIES_CODES;
  if (!seriesCodesStr) {
    throw new Error('EVDS_SERIES_CODES environment variable is required (comma-separated list)');
  }
  const seriesCodes = seriesCodesStr.split(',').map(code => code.trim());

  const startDateStr = process.env.EVDS_START_DATE;
  if (!startDateStr) {
    throw new Error('EVDS_START_DATE environment variable is required (format: YYYY-MM-DD)');
  }
  const startDate = new Date(startDateStr);
  if (Number.isNaN(startDate.getTime())) {
    throw new TypeError('Invalid EVDS_START_DATE format. Use YYYY-MM-DD');
  }

  const outputDir = process.env.EVDS_OUTPUT_DIR || './data';

  return { apiKey, seriesCodes, startDate, outputDir };
}

/**
 * Format date to YYYY.MM.DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Get the first day of the current month
 */
function getFirstDayOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Get today's date
 */
function getToday(): Date {
  return new Date();
}

/**
 * Fetch multiple series data with monthly aggregation using the client's getMultiSeries method
 */
async function fetchMultiSeriesMonthly(
  client: ReturnType<typeof createEVDSClient>,
  seriesCodes: string[],
  startDate: Date,
  endDate: Date
): Promise<Map<string, TimeSeriesItem[]>> {
  console.log(`Fetching monthly data for ${seriesCodes.length} series...`);
  
  const multiSeriesData = await client.getMultiSeries({
    series: seriesCodes,
    startDate,
    endDate,
    frequency: FrequencyType.MONTHLY,
    aggregationTypes: seriesCodes.map(() => AggregationType.AVERAGE),
  });

  // Convert to Map and format dates to first day of month
  const seriesMap = new Map<string, TimeSeriesItem[]>();
  
  for (const seriesData of multiSeriesData.seriesList) {
    const items: TimeSeriesItem[] = seriesData.items.map(item => {
      // Set to first day of the month
      const firstDay = new Date(item.date.getFullYear(), item.date.getMonth(), 1);
      return {
        date: formatDate(firstDay),
        value: convertValueToString(item.value),
      };
    });
    seriesMap.set(seriesData.code, items);
  }

  return seriesMap;
}

/**
 * Fetch today's values for multiple series using the client's getMultiSeries method
 */
async function fetchMultiSeriesToday(
  client: ReturnType<typeof createEVDSClient>,
  seriesCodes: string[]
): Promise<Map<string, string | null>> {
  console.log(`Fetching today's values for ${seriesCodes.length} series...`);
  
  const today = getToday();
  
  try {
    const multiSeriesData = await client.getMultiSeries({
      series: seriesCodes,
      startDate: today,
      endDate: today,
    });

    const todayValues = new Map<string, string | null>();
    
    for (const seriesData of multiSeriesData.seriesList) {
      if (seriesData.items.length > 0) {
        // Get the first (and likely only) item for today
        const value = seriesData.items[0].value;
        todayValues.set(seriesData.code, convertValueToString(value));
      } else {
        todayValues.set(seriesData.code, null);
      }
    }

    return todayValues;
  } catch (error) {
    // If today's data is not available, return null for all series
    console.log('Today\'s data not available, skipping current month update');
    console.error('Error details:', error instanceof Error ? error.message : error);
    const todayValues = new Map<string, string | null>();
    for (const code of seriesCodes) {
      todayValues.set(code, null);
    }
    return todayValues;
  }
}

/**
 * Update current month's value with today's value
 */
function updateCurrentMonthValue(items: TimeSeriesItem[], todayValue: string | null): TimeSeriesItem[] {
  const firstDayOfMonth = formatDate(getFirstDayOfCurrentMonth());
  
  const existingIndex = items.findIndex(item => item.date === firstDayOfMonth);
  
  if (existingIndex >= 0) {
    // Update existing entry
    items[existingIndex].value = todayValue;
  } else {
    // Add new entry for current month
    items.push({
      date: firstDayOfMonth,
      value: todayValue,
    });
  }

  return items;
}

/**
 * Save series data to individual file
 */
function saveSeriesFile(outputDir: string, seriesCode: string, items: TimeSeriesItem[]): void {
  // Filter out items with null values before saving
  const validItems = filterNullValues(items);
  
  const seriesData: SeriesData = {
    code: seriesCode,
    items: validItems,
  };

  const fileName = `${seriesCode}.json`;
  const filePath = path.join(outputDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(seriesData, null, 2), 'utf-8');
  console.log(`Saved ${fileName} with ${validItems.length} valid data points`);
}

/**
 * Save combined series file with timestamp (F0704)
 */
function saveCombinedFile(outputDir: string, allSeries: SeriesData[]): void {
  const combined: CombinedSeries = {
    timestamp: new Date().toISOString(),
    series: allSeries,
  };

  const filePath = path.join(outputDir, 'series.json');
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf-8');
  console.log(`Saved series.json with timestamp: ${combined.timestamp}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('EVDS Series Data Fetcher');
    console.log('========================\n');

    // Load configuration
    const config = loadConfig();
    console.log(`API Key: ${config.apiKey.substring(0, 1)}.......`);
    console.log(`Series codes: ${config.seriesCodes.join(', ')}`);
    console.log(`Start date: ${config.startDate.toISOString().split('T')[0]}`);
    console.log(`Output directory: ${config.outputDir}\n`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Create EVDS client
    const client = createEVDSClient({ apiKey: config.apiKey });

    // Fetch data for all series
    const allSeries: SeriesData[] = [];
    const endDate = getToday();

    try {
      // Fetch monthly data for all series in a single API call
      const monthlySeriesMap = await fetchMultiSeriesMonthly(client, config.seriesCodes, config.startDate, endDate);

      // Fetch today's values for all series in a single API call
      const todayValuesMap = await fetchMultiSeriesToday(client, config.seriesCodes);

      // Process each series
      for (const seriesCode of config.seriesCodes) {
        let items = monthlySeriesMap.get(seriesCode) || [];

        // Update current month with today's value if available
        const todayValue = todayValuesMap.get(seriesCode);
        if (todayValue !== null && todayValue !== undefined) {
          items = updateCurrentMonthValue(items, todayValue);
        }

        // Save individual series file
        saveSeriesFile(config.outputDir, seriesCode, items);

        // Add to combined series (filter out null values)
        const validItems = filterNullValues(items);
        allSeries.push({
          code: seriesCode,
          items: validItems,
        });
      }

      // Save combined file
      saveCombinedFile(config.outputDir, allSeries);
    } catch (error) {
      console.error('Error fetching series data:', error instanceof Error ? error.message : error);
      throw error;
    }

    console.log('\n✓ All series data fetched and saved successfully!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run with top-level await
await main();

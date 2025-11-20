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
  value: string;
}

/**
 * Series data structure
 */
interface SeriesData {
  name: string;
  items: TimeSeriesItem[];
}

/**
 * Combined series structure
 */
interface CombinedSeries {
  series: SeriesData[];
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
 * Fetch series data with monthly aggregation
 */
async function fetchMonthlySeries(
  client: ReturnType<typeof createEVDSClient>,
  seriesCode: string,
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesItem[]> {
  console.log(`Fetching monthly data for ${seriesCode}...`);
  
  const response = await client.getSeries({
    series: seriesCode,
    startDate,
    endDate,
    frequency: FrequencyType.MONTHLY,
    aggregationTypes: AggregationType.AVERAGE,
  });

  const items: TimeSeriesItem[] = [];
  for (const item of response.items) {
    const dateStr = item.Tarih as string;
    const value = item[seriesCode];
    
    if (value !== undefined && value !== null) {
      // Parse the date and format it to first day of month
      const date = new Date(dateStr);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      items.push({
        date: formatDate(firstDay),
        value: String(value),
      });
    }
  }

  return items;
}

/**
 * Fetch today's value for a series
 */
async function fetchTodayValue(
  client: ReturnType<typeof createEVDSClient>,
  seriesCode: string
): Promise<string | null> {
  console.log(`Fetching today's value for ${seriesCode}...`);
  
  const today = getToday();
  const response = await client.getSeries({
    series: seriesCode,
    startDate: today,
    endDate: today,
  });

  if (response.items.length > 0) {
    const value = response.items[0][seriesCode];
    return value !== undefined && value !== null ? String(value) : null;
  }

  return null;
}

/**
 * Update current month's value with today's value
 */
function updateCurrentMonthValue(items: TimeSeriesItem[], todayValue: string): TimeSeriesItem[] {
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
  const seriesData: SeriesData = {
    name: seriesCode,
    items,
  };

  const fileName = `${seriesCode}.json`;
  const filePath = path.join(outputDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(seriesData, null, 2), 'utf-8');
  console.log(`Saved ${fileName}`);
}

/**
 * Save combined series file
 */
function saveCombinedFile(outputDir: string, allSeries: SeriesData[]): void {
  const combined: CombinedSeries = {
    series: allSeries,
  };

  const filePath = path.join(outputDir, 'series.json');
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), 'utf-8');
  console.log(`Saved series.json`);
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
    console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
    console.log(`Series codes: ${config.seriesCodes.join(', ')}`);
    console.log(`Start date: ${config.startDate.toISOString().split('T')[0]}`);
    console.log(`Output directory: ${config.outputDir}\n`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // Create EVDS client
    const client = createEVDSClient({ apiKey: config.apiKey });

    // Fetch data for each series
    const allSeries: SeriesData[] = [];
    const endDate = getToday();

    for (const seriesCode of config.seriesCodes) {
      try {
        // Fetch monthly data
        let items = await fetchMonthlySeries(client, seriesCode, config.startDate, endDate);

        // Fetch today's value and update current month
        const todayValue = await fetchTodayValue(client, seriesCode);
        if (todayValue !== null) {
          items = updateCurrentMonthValue(items, todayValue);
        }

        // Save individual series file
        saveSeriesFile(config.outputDir, seriesCode, items);

        // Add to combined series
        allSeries.push({
          name: seriesCode,
          items,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error fetching ${seriesCode}:`, error instanceof Error ? error.message : error);
      }
    }

    // Save combined file
    saveCombinedFile(config.outputDir, allSeries);

    console.log('\n✓ All series data fetched and saved successfully!');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run with top-level await
await main();

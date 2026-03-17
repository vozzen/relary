/**
 * EVDS API Client
 * Wrapper for TCMB EVDS (Elektronik Veri Dağıtım Sistemi) Web Services
 */

import type {
  MultiSeriesData,
  SeriesItem,
  SeriesRequest,
  SeriesResponse,
} from './types';
import { FrequencyType, ResponseType } from './types';

/**
 * Configuration for EVDS Client
 */
export interface EVDSClientConfig {
  /** API key for authentication (obtained from EVDS profile) */
  apiKey: string;
  /** Base URL for EVDS API (default: https://evds3.tcmb.gov.tr/igmevdsms-dis) */
  baseUrl?: string;
}

/**
 * EVDS API Client
 * 
 * This client provides a typed wrapper around the TCMB EVDS Web Services API.
 * It handles API authentication, date formatting, and parameter serialization.
 * 
 * @example
 * ```typescript
 * const client = new EVDSClient({ apiKey: 'your-api-key' });
 * 
 * // Fetch series data
 * const data = await client.getSeries({
 *   series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31'),
 *   frequency: FrequencyType.MONTHLY,
 *   aggregationTypes: [AggregationType.AVERAGE, AggregationType.AVERAGE]
 * });
 * ```
 */
export class EVDSClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: EVDSClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://evds3.tcmb.gov.tr/igmevdsms-dis';
  }

  /**
   * Formats a Date object to DD-MM-YYYY format required by EVDS API
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Joins array values with '-' separator or returns single value
   */
  private joinParameter<T>(value: T | T[]): string {
    if (Array.isArray(value)) {
      return value.join('-');
    }
    return String(value);
  }

  /**
   * Maximum number of observations per API request (EVDS 3 limit)
   */
  private static readonly MAX_OBSERVATIONS = 150;

  /**
   * Converts a date parameter to a Date object for calculation
   */
  private toDate(date: Date | string): Date {
    if (date instanceof Date) {
      return date;
    }
    // Parse DD-MM-YYYY format
    const [day, month, year] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Estimates the number of observations between two dates for a given frequency.
   * Uses conservative estimates to avoid exceeding the 150-observation API limit.
   */
  private estimateObservations(start: Date, end: Date, frequency?: FrequencyType): number {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    switch (frequency) {
      case FrequencyType.ANNUAL:
        return Math.ceil(diffDays / 365) + 1;
      case FrequencyType.SEMI_ANNUAL:
        return Math.ceil(diffDays / 182) + 1;
      case FrequencyType.QUARTERLY:
        return Math.ceil(diffDays / 90) + 1;
      case FrequencyType.MONTHLY:
        return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      case FrequencyType.TWICE_A_MONTH:
        return Math.ceil(diffDays / 15) + 1;
      case FrequencyType.WEEKLY:
        return Math.ceil(diffDays / 7) + 1;
      case FrequencyType.BUSINESS_DAY:
        return Math.ceil(diffDays * 5 / 7) + 1;
      case FrequencyType.DAILY:
      default:
        // Default to daily (most granular) for safety
        return diffDays + 1;
    }
  }

  /**
   * Calculates the end date for a chunk given a start date, max observations, and frequency.
   */
  private chunkEndDate(start: Date, maxObs: number, frequency?: FrequencyType): Date {
    switch (frequency) {
      case FrequencyType.ANNUAL:
        return new Date(start.getFullYear() + maxObs - 1, start.getMonth(), start.getDate());
      case FrequencyType.SEMI_ANNUAL:
        return new Date(start.getFullYear(), start.getMonth() + (maxObs - 1) * 6, start.getDate());
      case FrequencyType.QUARTERLY:
        return new Date(start.getFullYear(), start.getMonth() + (maxObs - 1) * 3, start.getDate());
      case FrequencyType.MONTHLY:
        return new Date(start.getFullYear(), start.getMonth() + maxObs - 1, start.getDate());
      case FrequencyType.TWICE_A_MONTH: {
        const days = (maxObs - 1) * 15;
        return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      }
      case FrequencyType.WEEKLY: {
        const days = (maxObs - 1) * 7;
        return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      }
      case FrequencyType.BUSINESS_DAY: {
        const calendarDays = Math.ceil((maxObs - 1) * 7 / 5);
        return new Date(start.getTime() + calendarDays * 24 * 60 * 60 * 1000);
      }
      case FrequencyType.DAILY:
      default: {
        const days = maxObs - 1;
        return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      }
    }
  }

  /**
   * Returns the next day after a given date (for non-overlapping chunk boundaries)
   */
  private nextDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }

  /**
   * Makes an HTTP request to EVDS API with proper authentication
   */
  private async request<T>(params: Record<string, string>): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${queryString}`;

    const response = await fetch(url, {
      headers: {
        'key': this.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('EVDS API authentication failed. Please check your API key.');
      }
      throw new Error(`EVDS API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Fetches series data from EVDS, automatically splitting into chunked
   * requests when the date range exceeds the 150-observation API limit.
   */
  private async getSeries(request: SeriesRequest): Promise<SeriesResponse> {
    const start = this.toDate(request.startDate);
    const end = this.toDate(request.endDate);
    const estimatedObs = this.estimateObservations(start, end, request.frequency);

    if (estimatedObs <= EVDSClient.MAX_OBSERVATIONS) {
      return this.getSeriesChunk(request);
    }

    // Split into chunks
    const allItems: SeriesResponse['items'] = [];
    let chunkStart = start;

    while (chunkStart <= end) {
      const chunkEnd = this.chunkEndDate(chunkStart, EVDSClient.MAX_OBSERVATIONS, request.frequency);
      const effectiveEnd = chunkEnd < end ? chunkEnd : end;

      const chunkResponse = await this.getSeriesChunk({
        ...request,
        startDate: chunkStart,
        endDate: effectiveEnd,
      });

      allItems.push(...chunkResponse.items);

      if (effectiveEnd >= end) {
        break;
      }
      chunkStart = this.nextDay(effectiveEnd);
    }

    return { items: allItems };
  }

  /**
   * Fetches a single chunk of series data from EVDS (no chunking).
   */
  private async getSeriesChunk(request: SeriesRequest): Promise<SeriesResponse> {
    const params: Record<string, string> = {
      series: this.joinParameter(request.series),
      startDate: this.formatDate(request.startDate),
      endDate: this.formatDate(request.endDate),
      type: request.type || ResponseType.JSON,
    };

    if (request.decimalSeparator) {
      params.decimalSeparator = request.decimalSeparator;
    }

    if (request.aggregationTypes) {
      params.aggregationTypes = this.joinParameter(request.aggregationTypes);
    }

    if (request.formulas) {
      params.formulas = this.joinParameter(request.formulas);
    }

    if (request.frequency) {
      params.frequency = request.frequency;
    }

    return this.request<SeriesResponse>(params);
  }

    async getMultiSeries(request: SeriesRequest): Promise<MultiSeriesData> {
        const rawSeriesResponse = await this.getSeries(request);
        const seriesArray = Array.isArray(request.series) ? request.series : [request.series];
        const multiSeriesData: MultiSeriesData = { seriesList: [] };

        const tempSeries: Record<string, SeriesItem[]> = {};

        rawSeriesResponse.items.forEach(rawItem => {
            seriesArray.forEach(seriesCode => {
                const correctedCode = seriesCode.replaceAll('.', '_');
                const value = rawItem[correctedCode];
                if (value !== undefined) {
                    if (!tempSeries[seriesCode]) {
                        tempSeries[seriesCode] = [];
                    }
                    const date = this.parseDateText(rawItem.Tarih)
                    tempSeries[seriesCode].push({ date, value: Number.parseFloat(value) });
                }
            })
        });

        for (const seriesCode of seriesArray) {
            multiSeriesData.seriesList.push({
                code: seriesCode,
                items: tempSeries[seriesCode] || [],
            });
        }
        return multiSeriesData;
    }

    private parseDateText(dateText: string): Date {
        const [year, month, day] = dateText.split('-').map(part => parseInt(part, 10));
        return new Date(year, month - 1, day ?? 15);
    }
}

/**
 * Creates a new EVDS client instance
 * 
 * @param config - Client configuration
 * @returns EVDS client instance
 * 
 * @example
 * ```typescript
 * const client = createEVDSClient({ apiKey: process.env.EVDS_API_KEY });
 * ```
 */
export function createEVDSClient(config: EVDSClientConfig): EVDSClient {
  return new EVDSClient(config);
}

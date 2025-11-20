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
import { ResponseType } from './types';

/**
 * Configuration for EVDS Client
 */
export interface EVDSClientConfig {
  /** API key for authentication (obtained from EVDS profile) */
  apiKey: string;
  /** Base URL for EVDS API (default: https://evds2.tcmb.gov.tr/service/evds) */
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
    this.baseUrl = config.baseUrl || 'https://evds2.tcmb.gov.tr/service/evds';
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
   * Fetches series data from EVDS
   * 
   * @param request - Series request parameters
   * @returns Series data response
   * 
   * @example
   * ```typescript
   * const data = await client.getSeries({
   *   series: 'TP.DK.USD.A',
   *   startDate: new Date('2024-01-01'),
   *   endDate: new Date('2024-12-31')
   * });
   * ```
   */
  private async getSeries(request: SeriesRequest): Promise<SeriesResponse> {
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

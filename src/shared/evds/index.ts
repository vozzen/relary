/**
 * EVDS (Elektronik Veri Dağıtım Sistemi) API Client
 * 
 * This module provides a TypeScript client for the Turkish Central Bank's
 * Electronic Data Distribution System (EVDS) Web Services.
 * 
 * @example
 * ```typescript
 * import { createEVDSClient, FrequencyType, AggregationType } from './evds';
 * 
 * const client = createEVDSClient({ apiKey: 'your-api-key' });
 * 
 * const data = await client.getSeries({
 *   series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-12-31'),
 *   frequency: FrequencyType.MONTHLY,
 *   aggregationTypes: [AggregationType.AVERAGE, AggregationType.AVERAGE]
 * });
 * ```
 * 
 * @module evds
 */

export { EVDSClient, createEVDSClient } from './client';
export type { EVDSClientConfig } from './client';

export {
  AggregationType,
  FormulaType,
  FrequencyType,
  ResponseType,
  DecimalSeparator,
  DataGroupMode,
} from './types';

export type {
  SeriesRequest,
  SeriesDataPoint,
  SeriesResponse,
  DataGroupRequest,
  Category,
  DataGroup,
  SeriesMetadata,
  DataGroupsRequest,
  SeriesListRequest,
} from './types';

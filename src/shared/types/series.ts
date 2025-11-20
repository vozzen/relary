/**
 * Time series data point from file
 */
export interface SeriesDataPoint {
  date: string
  value: string
}

/**
 * Single series data from file
 */
export interface SeriesData {
  code: string
  items: SeriesDataPoint[]
}

/**
 * Combined series file structure
 */
export interface CombinedSeriesData {
  series: SeriesData[]
}

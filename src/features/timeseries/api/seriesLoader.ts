import type { Dispatch } from 'react'
import type { TimeseriesAction, TimeseriesPoint, CombinedSeriesData } from '../../../shared/types'
import { actions } from '../../../app/store'
import seriesData from '../../../../data/series.json'

/**
 * Converts series data point from file format to internal format
 */
function convertDataPoint(item: { date: string; value: string }): TimeseriesPoint {
  // Convert date from "2025.08.01" to "08.2025" format
  const [year, month] = item.date.split('.')
  return {
    date: `${month}.${year}`,
    value: Number.parseFloat(item.value),
  }
}

/**
 * Load series data from imported JSON file and populate store
 */
export function loadSeriesData(dispatch: Dispatch<TimeseriesAction>): void {
  try {
    actions.setStatus(dispatch, 'loading')

    const data = seriesData as CombinedSeriesData
    const codes: string[] = []

    // Load each series into remoteSeries
    for (const series of data.series) {
      codes.push(series.code)
      const points = series.items.map(convertDataPoint)
      actions.setRemoteSeries(dispatch, series.code, points)
    }

    // Set available series codes
    actions.setAvailableSeries(dispatch, codes)

    // Don't initialize selection state - let Chart component use getDefaultSelection
    // This ensures F0615 requirements are met (only Gelir(₺), Gelir(USD), Alım gücü enabled)

    actions.setStatus(dispatch, 'idle')
  } catch (error) {
    actions.setError(dispatch, error instanceof Error ? error.message : 'Failed to load series data')
    actions.setStatus(dispatch, 'error')
  }
}

import type { Dispatch } from 'react'
import type { TimeseriesAction, TimeseriesPoint, CombinedSeriesData } from '../../../shared/types'
import { actions } from '../../../app/store'

/**
 * GitHub Pages URL for series data (F0703)
 */
const SERIES_DATA_URL = 'https://relary.sen.kim/data/series.json'

/**
 * Fallback to local data in development or if fetch fails
 */
const loadLocalData = async (): Promise<CombinedSeriesData> => {
  const module = await import('../../../../data/series.json')
  return module.default as CombinedSeriesData
}

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
 * Load series data from GitHub Pages or fallback to local file (F0703)
 */
export async function loadSeriesData(dispatch: Dispatch<TimeseriesAction>): Promise<void> {
  try {
    actions.setStatus(dispatch, 'loading')

    let data: CombinedSeriesData

    // Try to fetch from GitHub Pages first
    try {
      const response = await fetch(SERIES_DATA_URL)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      data = await response.json()
    } catch (fetchError) {
      // Fallback to local data if fetch fails
      console.warn('Failed to fetch from GitHub Pages, using local data:', fetchError)
      data = await loadLocalData()
    }

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

import { request } from '../../../app/config/client'
import { actions } from '../../../app/store'
import type { TimeseriesPoint, TimeseriesAction } from '../../../shared/types'
import type { Dispatch } from 'react'

interface RemoteTimeseriesResponse {
  key: string
  points: TimeseriesPoint[]
}

/**
 * Fetch remote timeseries data for a given key.
 * Currently uses stub fallback if network fails or endpoint missing.
 */
export async function getRemoteTimeseries(key: string): Promise<TimeseriesPoint[]> {
  const data = await request<RemoteTimeseriesResponse>(`/timeseries/${encodeURIComponent(key)}`).catch(() => {
    // Fallback stub until backend implemented
    return { key, points: [
      { date: '01.2024', value: 100 },
      { date: '02.2024', value: 104 },
      { date: '03.2024', value: 102 },
    ] }
  })
  return data.points
}

/**
 * High-level loader integrating with global store.
 */
export async function loadRemoteTimeseries(
  dispatch: Dispatch<TimeseriesAction>,
  key: string
): Promise<void> {
  actions.setStatus(dispatch, 'loading')
  try {
    const series = await getRemoteTimeseries(key)
    actions.setRemoteSeries(dispatch, key, series)
    actions.setStatus(dispatch, 'idle')
  } catch (err) {
    actions.setError(dispatch, err instanceof Error ? err.message : 'Unknown error')
    actions.setStatus(dispatch, 'error')
  }
}

/**
 * Convenience hook-like helper for future integration.
 * Returns a function that loads a key when invoked.
 */
export function createRemoteLoader(dispatch: Dispatch<TimeseriesAction>) {
  return (key: string) => loadRemoteTimeseries(dispatch, key)
}

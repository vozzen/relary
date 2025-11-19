export type TimeseriesPoint = {
  date: string // Accepts DD.MM.YYYY | MM.YYYY | MM-YYYY (normalized later)
  value: number
}

export interface TimeseriesState {
  userSeries: TimeseriesPoint[]
  remoteSeries: Record<string, TimeseriesPoint[]>
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

export interface AppState {
  timeseries: TimeseriesState
}

export type TimeseriesAction =
  | { type: 'SET_USER_SERIES'; payload: TimeseriesPoint[] }
  | { type: 'SET_REMOTE_SERIES'; payload: { key: string; series: TimeseriesPoint[] } }
  | { type: 'SET_STATUS'; payload: TimeseriesState['status'] }
  | { type: 'SET_ERROR'; payload: string | null }

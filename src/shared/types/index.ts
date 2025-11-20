export type TimeseriesPoint = {
  date: string // Accepts DD.MM.YYYY | MM.YYYY | MM-YYYY (normalized later)
  value: number
}

export interface TimeseriesState {
  userSeries: TimeseriesPoint[]
  remoteSeries: Record<string, TimeseriesPoint[]>
  availableSeries: string[] // Available series codes from loaded data
  selectedSeries: Record<string, boolean> // Series selection state
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

export interface AppState {
  timeseries: TimeseriesState
}

export type TimeseriesAction =
  | { type: 'SET_USER_SERIES'; payload: TimeseriesPoint[] }
  | { type: 'SET_REMOTE_SERIES'; payload: { key: string; series: TimeseriesPoint[] } }
  | { type: 'SET_AVAILABLE_SERIES'; payload: string[] }
  | { type: 'SET_SERIES_SELECTION'; payload: { code: string; selected: boolean } }
  | { type: 'SET_STATUS'; payload: TimeseriesState['status'] }
  | { type: 'SET_ERROR'; payload: string | null }

export * from './series'

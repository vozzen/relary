import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { AppState, TimeseriesAction, TimeseriesState, TimeseriesPoint } from '../../shared/types'

// Initial state for timeseries feature
const initialTimeseriesState: TimeseriesState = {
  userSeries: [],
  remoteSeries: {},
  availableSeries: [],
  selectedSeries: {},
  status: 'idle',
  error: null,
}

const initialAppState: AppState = {
  timeseries: initialTimeseriesState,
}

/**
 * Reducer handling all timeseries-related actions.
 */
function timeseriesReducer(state: TimeseriesState, action: TimeseriesAction): TimeseriesState {
  switch (action.type) {
    case 'SET_USER_SERIES':
      return { ...state, userSeries: action.payload }
    case 'SET_REMOTE_SERIES':
      return {
        ...state,
        remoteSeries: { ...state.remoteSeries, [action.payload.key]: action.payload.series },
      }
    case 'SET_AVAILABLE_SERIES':
      return { ...state, availableSeries: action.payload }
    case 'SET_SERIES_SELECTION':
      return {
        ...state,
        selectedSeries: { ...state.selectedSeries, [action.payload.code]: action.payload.selected },
      }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

/**
 * Root reducer delegates to feature reducers (currently only timeseries).
 */
function rootReducer(state: AppState, action: TimeseriesAction): AppState {
  return {
    timeseries: timeseriesReducer(state.timeseries, action),
  }
}

const StateContext = createContext<AppState | undefined>(undefined)
const DispatchContext = createContext<Dispatch<TimeseriesAction> | undefined>(undefined)

/**
 * Top-level provider composing state & dispatch contexts.
 */
export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(rootReducer, initialAppState)
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

/**
 * Hook to access immutable snapshot of global state.
 */
export function useAppState(): AppState {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStoreProvider')
  return ctx
}

/**
 * Hook to access dispatch for issuing actions.
 */
export function useAppDispatch(): Dispatch<TimeseriesAction> {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppStoreProvider')
  return ctx
}

/**
 * Ergonomic action helpers to reduce inline object creation.
 */
export const actions = {
  setUserSeries: (dispatch: Dispatch<TimeseriesAction>, points: TimeseriesPoint[]) =>
    dispatch({ type: 'SET_USER_SERIES', payload: points }),
  setRemoteSeries: (
    dispatch: Dispatch<TimeseriesAction>,
    key: string,
    series: TimeseriesPoint[]
  ) => dispatch({ type: 'SET_REMOTE_SERIES', payload: { key, series } }),
  setAvailableSeries: (dispatch: Dispatch<TimeseriesAction>, codes: string[]) =>
    dispatch({ type: 'SET_AVAILABLE_SERIES', payload: codes }),
  setSeriesSelection: (dispatch: Dispatch<TimeseriesAction>, code: string, selected: boolean) =>
    dispatch({ type: 'SET_SERIES_SELECTION', payload: { code, selected } }),
  setStatus: (dispatch: Dispatch<TimeseriesAction>, status: TimeseriesState['status']) =>
    dispatch({ type: 'SET_STATUS', payload: status }),
  setError: (dispatch: Dispatch<TimeseriesAction>, error: string | null) =>
    dispatch({ type: 'SET_ERROR', payload: error }),
}

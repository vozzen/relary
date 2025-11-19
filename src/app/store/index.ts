import React, { createContext, useContext, useReducer, type ReactNode, Dispatch } from 'react'
import type { AppState, TimeseriesAction, TimeseriesState, TimeseriesPoint } from '../../shared/types'

// Initial state for timeseries feature
const initialTimeseriesState: TimeseriesState = {
	userSeries: [],
	remoteSeries: {},
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
 * Provides global application state via React Context + useReducer.
 */
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

/** Hook for accessing global AppState */
/**
 * Hook to access immutable snapshot of global state.
 */
export function useAppState(): AppState {
	const ctx = useContext(StateContext)
	if (!ctx) throw new Error('useAppState must be used within AppStoreProvider')
	return ctx
}

/** Hook for dispatching actions */
/**
 * Hook to access dispatch for issuing actions.
 */
export function useAppDispatch(): Dispatch<TimeseriesAction> {
	const ctx = useContext(DispatchContext)
	if (!ctx) throw new Error('useAppDispatch must be used within AppStoreProvider')
	return ctx
}

// Convenience action helpers (optional ergonomic layer)
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
	setStatus: (dispatch: Dispatch<TimeseriesAction>, status: TimeseriesState['status']) =>
		dispatch({ type: 'SET_STATUS', payload: status }),
	setError: (dispatch: Dispatch<TimeseriesAction>, error: string | null) =>
		dispatch({ type: 'SET_ERROR', payload: error }),
}

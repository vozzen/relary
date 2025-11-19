import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * Wraps the application with global providers (router, error boundary).
 */
export const AppProviders = ({ children }: { children: ReactNode }) => {
	return (
		<ErrorBoundary>
			<BrowserRouter>{children}</BrowserRouter>
		</ErrorBoundary>
	)
}

export * from './ErrorBoundary'

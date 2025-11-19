import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { AppStoreProvider } from '../store'

/**
 * Wraps the application with global providers (router, error boundary).
 */
export const AppProviders = ({ children }: { children: ReactNode }) => {
	return (
		<ErrorBoundary>
			<AppStoreProvider>
				<BrowserRouter>{children}</BrowserRouter>
			</AppStoreProvider>
		</ErrorBoundary>
	)
}

export * from './ErrorBoundary'

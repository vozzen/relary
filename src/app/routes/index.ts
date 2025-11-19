// Placeholder for route definitions (will be populated in F002)
import type { ReactNode } from 'react'
import { HomePage } from '../../features/timeseries'

export interface AppRoute {
  path: string
  element: ReactNode
}

/**
 * Application route definitions.
 * Extend in future features (F005+, etc.).
 */
export const routes: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />,
  },
]

import type { ReactNode } from 'react'
import { HomePage } from '../../features/timeseries'
import { NotFound } from '../../shared/components/NotFound'

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
  {
    path: '*',
    element: <NotFound />,
  },
]

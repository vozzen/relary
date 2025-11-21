import type { FC, ReactNode } from 'react'
import { APP_NAME } from '../../app/config/constants'
import { Link } from 'react-router-dom'
import './Header.css'

interface HeaderProps {
  actions?: ReactNode
}

/**
 * Application header displaying brand and navigation placeholder.
 * Future enhancements (F007/F008):
 *  - Replace placeholder span with dynamic nav items
 *  - Inject loading/error indicators via actions prop
 */
export const Header: FC<HeaderProps> = ({ actions }) => {
  return (
    <header role="banner" className="app-header">
      <div className="app-header__brand">
        <Link to="/" aria-label="Ana Sayfa" className="app-header__title">
          <img src="/relary.svg" alt="Relary logo" className="app-header__logo" />
          {APP_NAME}
        </Link>
      </div>
      <nav aria-label="Ana gezinme" className="app-header__nav">
      </nav>
      <div className="app-header__actions">{actions}</div>
    </header>
  )
}

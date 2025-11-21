import type { FC } from 'react'
import './Footer.css'

/**
 * Static application footer (F006, F0702).
 * Displays privacy reassurance text and application version.
 */
export const Footer: FC = () => {
  // Get version from package.json via import.meta.env
  const version = __APP_VERSION__
  
  return (
    <footer className="app-footer" role="contentinfo" aria-label="Uygulama altbilgisi">
      <p className="app-footer__text">Hiçbir veri sunuculara gönderilmez</p>
      <p className="app-footer__text">
        Ham veriler (kur, enflasyon vb.) <a className="app-footer__link" href="https://evds2.tcmb.gov.tr/" target="_blank" rel="noopener noreferrer">TCMB EVDS</a> sisteminden alınmıştır.
      </p>
      <p className="app-footer__version">v{version}</p>
    </footer>
  )
}

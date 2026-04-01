import type { FC } from 'react'
import { HowItWorksModal } from './HowItWorksModal'
import './Footer.css'

/**
 * Static application footer (F006, F0702, F0810).
 * Displays privacy reassurance text, "Nasıl Çalışır?" modal link, and app version.
 */
export const Footer: FC = () => {
  // Get version from package.json via import.meta.env
  const version = __APP_VERSION__
  
  return (
    <footer className="app-footer" role="contentinfo" aria-label="Uygulama altbilgisi">
      <p className="app-footer__text">Hiçbir veri sunuculara gönderilmez</p>
      <p className="app-footer__text">
        Ham veriler (kur, enflasyon vb.) <a className="app-footer__link" href="https://evds3.tcmb.gov.tr/" target="_blank" rel="noopener noreferrer">TCMB EVDS</a>'den alınmıştır.
      </p>
      {/* F0810: "Nasıl Çalışır?" modal trigger */}
      <p className="app-footer__text"><HowItWorksModal /></p>
      <p className="app-footer__version">v{version}</p>
    </footer>
  )
}

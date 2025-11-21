import type { FC } from 'react'
import './Footer.css'

/**
 * Static application footer (F006).
 * Displays privacy reassurance text.
 */
export const Footer: FC = () => {
  return (
    <footer className="app-footer" role="contentinfo" aria-label="Uygulama altbilgisi">
      <p className="app-footer__text">Hiçbir veri sunuculara gönderilmez</p>
      Ham veriler (kur, enflasyon vb.) <a className="app-footer__text" href="https://evds2.tcmb.gov.tr/" target="_blank" rel="noopener noreferrer">TCMB EVDS</a> sisteminden alınmıştır.
    </footer>
  )
}

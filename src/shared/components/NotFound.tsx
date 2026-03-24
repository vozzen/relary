import type { FC } from 'react'
import { Link } from 'react-router-dom'

export const NotFound: FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#f1f5f9' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>Sayfa bulunamadı</p>
      <Link to="/" style={{ color: '#22c55e', textDecoration: 'underline' }}>
        Ana sayfaya dön
      </Link>
    </div>
  )
}

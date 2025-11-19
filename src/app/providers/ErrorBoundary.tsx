import React, { type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary with enhanced UI and reset capability (F014).
 */
export class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    globalThis.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: '#0f172a',
            color: '#f1f5f9',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '2rem',
              background: '#1e293b',
              borderRadius: '8px',
              border: '2px solid #ef4444',
            }}
          >
            <h1 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem' }}>
              Beklenmeyen Bir Hata Oluştu
            </h1>
            <p style={{ marginBottom: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              Uygulama beklenmeyen bir hatayla karşılaştı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
            </p>
            {this.state.error && (
              <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Teknik Detaylar
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: '#0f172a',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    color: '#64748b',
                    overflow: 'auto',
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

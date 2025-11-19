import type { FC } from 'react'
import './ErrorMessage.css'

export interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * Inline error message component (F014).
 * Displays user-friendly error messages with optional retry action.
 */
export const ErrorMessage: FC<ErrorMessageProps> = ({ message, onRetry, className }) => {
  return (
    <div className={`error-message ${className || ''}`.trim()} role="alert">
      <div className="error-message__icon" aria-hidden="true">
        ⚠️
      </div>
      <div className="error-message__content">
        <p className="error-message__text">{message}</p>
        {onRetry && (
          <button className="error-message__retry" onClick={onRetry} type="button">
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  )
}

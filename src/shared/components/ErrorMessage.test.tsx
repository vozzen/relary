import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Test error message" />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should render retry button when onRetry provided', () => {
    const onRetry = () => {}
    render(<ErrorMessage message="Test error" onRetry={onRetry} />)
    
    expect(screen.getByRole('button', { name: /tekrar dene/i })).toBeInTheDocument()
  })

  it('should not render retry button when onRetry not provided', () => {
    render(<ErrorMessage message="Test error" />)
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<ErrorMessage message="Test error" className="custom-class" />)
    const errorDiv = container.querySelector('.error-message')
    
    expect(errorDiv).toHaveClass('custom-class')
  })
})

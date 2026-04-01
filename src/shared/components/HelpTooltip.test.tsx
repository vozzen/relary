import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelpTooltip } from './HelpTooltip'

// F0812: HelpTooltip component tests
describe('HelpTooltip', () => {
  it('renders the question mark icon', () => {
    render(<HelpTooltip text="Test tooltip" />)
    expect(screen.getByText('?')).toBeTruthy()
  })

  it('renders the tooltip text', () => {
    render(<HelpTooltip text="Helpful information" />)
    expect(screen.getByText('Helpful information')).toBeTruthy()
  })

  it('has proper aria-label for accessibility', () => {
    render(<HelpTooltip text="Accessible tooltip" />)
    const tooltip = screen.getByRole('img')
    expect(tooltip.getAttribute('aria-label')).toBe('Accessible tooltip')
  })
})

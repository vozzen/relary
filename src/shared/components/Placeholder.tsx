import type { FC } from 'react'

export const Placeholder: FC<{ label?: string }> = ({ label = 'Placeholder' }) => {
  return <div data-testid="placeholder">{label}</div>
}

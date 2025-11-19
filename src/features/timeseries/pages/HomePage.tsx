import type { FC } from 'react'
import { Placeholder } from '../../../shared/components/Placeholder'

/**
 * HomePage renders initial landing content.
 */
export const HomePage: FC = () => {
  return (
    <div>
      <h2>Hoş Geldiniz</h2>
      <Placeholder label="Timeseries Module Placeholder" />
    </div>
  )
}

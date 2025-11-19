import type { FC } from 'react'
import { useState, useCallback } from 'react'
import { Placeholder } from '../../../shared/components/Placeholder'
import { parseTimeseriesInput } from '../../../shared/utils'
import { useAppDispatch, actions } from '../../../app/store'
import './HomePage.css'

/**
 * HomePage (F007) layout with chart placeholder and timeseries editor.
 * Valid input updates global userSeries; invalid input visually highlighted.
 */
export const HomePage: FC = () => {
  const dispatch = useAppDispatch()
  const [raw, setRaw] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setRaw(value)
      const { points, valid } = parseTimeseriesInput(value)
      setValid(value.trim() ? valid : null)
      if (valid) actions.setUserSeries(dispatch, points)
    },
    [dispatch]
  )

  return (
    <section className="home-page">
      <div className="chart-section">
        <div className="chart-placeholder" aria-label="Zaman serisi grafiği placeholder">
          Chart Placeholder (F009 planlanıyor)
        </div>
      </div>
      <div className="editor-section">
        <label htmlFor="timeseries-editor">Veri Girişi</label>
        {(() => {
          let variant = ''
          if (valid !== null) {
            variant = valid ? 'is-valid' : 'is-invalid'
          }
          const className = `timeseries-editor ${variant}`.trim()
          return (
            <textarea
              id="timeseries-editor"
              className={className}
              placeholder={'Örnek:\n01.2024 120\n15.02.2024 130\n03-2024 140'}
              value={raw}
              onChange={handleChange}
              aria-invalid={valid === false}
            />
          )
        })()}
        <small className="editor-help">
          Formatlar: DD.MM.YYYY | MM.YYYY | MM-YYYY — Her satır: tarih değer
        </small>
        <Placeholder label="Timeseries Module Placeholder" />
      </div>
    </section>
  )
}

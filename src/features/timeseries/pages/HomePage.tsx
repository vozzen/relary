import type { FC } from 'react'
import { useState, useCallback, useEffect } from 'react'
import { Placeholder } from '../../../shared/components/Placeholder'
import { ErrorMessage } from '../../../shared/components/ErrorMessage'
import { parseTimeseriesInput, interpolateMonthlyTimeseries } from '../../../shared/utils'
import { useAppDispatch, useAppState, actions } from '../../../app/store'
import { loadRemoteTimeseries } from '../api/service'
import './HomePage.css'
import { Chart } from '../components/Chart'

/**
 * HomePage (F007) layout with chart placeholder and timeseries editor.
 * Valid input updates global userSeries; invalid input visually highlighted.
 * User data is automatically interpolated to fill monthly gaps (F012).
 * Enhanced with error handling (F014).
 */
export const HomePage: FC = () => {
  const dispatch = useAppDispatch()
  const state = useAppState()
  const [raw, setRaw] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)

  // Load remote data on mount (example key - would be configurable in production)
  useEffect(() => {
    loadRemoteTimeseries(dispatch, 'example').catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load remote timeseries:', err)
    })
  }, [dispatch])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setRaw(value)
      const { points, valid } = parseTimeseriesInput(value)
      setValid(value.trim() ? valid : null)
      if (valid) {
        // Interpolate to fill monthly gaps before dispatching
        const interpolated = interpolateMonthlyTimeseries(points)
        actions.setUserSeries(dispatch, interpolated)
      }
    },
    [dispatch]
  )

  const handleRetry = useCallback(() => {
    actions.setError(dispatch, null)
    loadRemoteTimeseries(dispatch, 'example').catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to load remote timeseries:', err)
    })
  }, [dispatch])

  return (
    <section className="home-page">
      {state.timeseries.error && (
        <ErrorMessage
          message={`Uzak veri yüklenemedi: ${state.timeseries.error}`}
          onRetry={handleRetry}
        />
      )}
      <div className="chart-section">
        <Chart />
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

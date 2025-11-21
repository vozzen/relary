import type { FC } from 'react'
import { useState, useCallback, useEffect } from 'react'
import { ErrorMessage } from '../../../shared/components/ErrorMessage'
import { parseTimeseriesInput, interpolateMonthlyTimeseries, getSeriesFriendlyName } from '../../../shared/utils'
import { useAppDispatch, useAppState, actions } from '../../../app/store'
import { loadSeriesData } from '../api/seriesLoader'
import { saveDataset, loadDataset, listDatasets, deleteDataset } from '../../../shared/utils/storage'
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
  const [savedDatasets, setSavedDatasets] = useState<string[]>([])
  const [datasetName, setDatasetName] = useState('')

  // Load series data on mount and refresh saved datasets list
  useEffect(() => {
    loadSeriesData(dispatch)
    setSavedDatasets(listDatasets())
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
        
        // Update available series to include derived series (F0606, F0610)
        const derivedCodes = Object.keys(state.timeseries.remoteSeries)
          .filter(code => code.startsWith('TP.DK.'))
          .map(code => `Gelir(${getSeriesFriendlyName(code)})`)
        
        const allCodes = [...state.timeseries.availableSeries, ...derivedCodes]
        // Remove duplicates
        const uniqueCodes = Array.from(new Set(allCodes))
        actions.setAvailableSeries(dispatch, uniqueCodes)
      }
    },
    [dispatch, state.timeseries.remoteSeries, state.timeseries.availableSeries]
  )

  const handleRetry = useCallback(() => {
    actions.setError(dispatch, null)
    loadSeriesData(dispatch)
  }, [dispatch])

  const handleSave = useCallback(() => {
    if (!datasetName.trim()) {
      alert('Lütfen bir isim girin')
      return
    }
    if (!raw.trim()) {
      alert('Kaydedilecek veri yok')
      return
    }
    try {
      saveDataset(datasetName.trim(), raw)
      setSavedDatasets(listDatasets())
      setDatasetName('')
      alert(`"${datasetName.trim()}" kaydedildi`)
    } catch (err) {
      alert(`Kaydetme hatası: ${err instanceof Error ? err.message : String(err)}`)
    }
  }, [datasetName, raw])

  const handleLoad = useCallback((name: string) => {
    const data = loadDataset(name)
    if (data) {
      setRaw(data)
      // Trigger the change handler to update the chart
      const { points, valid } = parseTimeseriesInput(data)
      setValid(data.trim() ? valid : null)
      if (valid) {
        const interpolated = interpolateMonthlyTimeseries(points)
        actions.setUserSeries(dispatch, interpolated)
        
        const derivedCodes = Object.keys(state.timeseries.remoteSeries)
          .filter(code => code.startsWith('TP.DK.'))
          .map(code => `Gelir(${getSeriesFriendlyName(code)})`)
        
        const allCodes = [...state.timeseries.availableSeries, ...derivedCodes]
        const uniqueCodes = Array.from(new Set(allCodes))
        actions.setAvailableSeries(dispatch, uniqueCodes)
      }
    } else {
      alert(`"${name}" yüklenemedi`)
    }
  }, [dispatch, state.timeseries.remoteSeries, state.timeseries.availableSeries])

  const handleDelete = useCallback((name: string) => {
    if (confirm(`"${name}" silinsin mi?`)) {
      deleteDataset(name)
      setSavedDatasets(listDatasets())
    }
  }, [])

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
      <div className="controls-container">
        <div className="editor-section">
          <h3 className="section-header">Veri Girişi</h3>
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
            Formatlar: DD.MM.YYYY | MM.YYYY | MM-YYYY
          </small>
        </div>
        
        <div className="storage-section">
          <h3 className="section-header">Kaydet/Yükle</h3>
          <div className="save-section">
            <input
              type="text"
              placeholder="Veri seti adı"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="dataset-name-input"
            />
            <button type="button" onClick={handleSave} className="save-button">
              Kaydet
            </button>
          </div>
          
          {savedDatasets.length > 0 && (
            <div className="load-section">
              <ul className="dataset-list">
                {savedDatasets.map(name => (
                  <li key={name} className="dataset-item">
                    <button 
                      type="button" 
                      onClick={() => handleLoad(name)}
                      className="load-button"
                    >
                      {name}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDelete(name)}
                      className="delete-button"
                      aria-label={`${name} sil`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

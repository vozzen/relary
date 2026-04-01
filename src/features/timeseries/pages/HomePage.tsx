import type { FC } from 'react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { ErrorMessage } from '../../../shared/components/ErrorMessage'
import { parseTimeseriesInput, interpolateMonthlyTimeseries, getSeriesFriendlyName } from '../../../shared/utils'
import { useAppDispatch, useAppState, actions } from '../../../app/store'
import { loadSeriesData } from '../api/seriesLoader'
import { saveDataset, loadDataset, listDatasets, deleteDataset } from '../../../shared/utils/storage'
import './HomePage.css'
import { Chart } from '../components/Chart'
import { HelpTooltip } from '../../../shared/components/HelpTooltip'

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
  // F0813: Hide/show toggle for data entry
  const [isDataHidden, setIsDataHidden] = useState(false)
  const hiddenDataRef = useRef('')

  // Load series data on mount and refresh saved datasets list
  useEffect(() => {
    loadSeriesData(dispatch).catch(console.error)
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

  // F0813: Mask data by replacing dates with XX.XX.XXXX and amounts with XXXXXX
  const maskData = useCallback((text: string): string => {
    return text.split('\n').map(line => {
      const trimmed = line.trim()
      if (!trimmed) return line
      return trimmed.replace(/\S+/g, (_token, offset) => {
        if (offset === 0) return 'XX.XX.XXXX'
        return 'XXXXXX'
      })
    }).join('\n')
  }, [])

  // F0813: Save original data even when hidden
  const handleSave = useCallback(() => {
    const dataToSave = isDataHidden ? hiddenDataRef.current : raw
    if (!datasetName.trim() || !dataToSave.trim()) {
      return
    }
    saveDataset(datasetName.trim(), dataToSave)
    setSavedDatasets(listDatasets())
    setDatasetName('')
  }, [datasetName, raw, isDataHidden])

  const handleLoad = useCallback((name: string) => {
    const data = loadDataset(name)
    if (data) {
      // F0813: Keep hidden mode; store original in ref and show masked
      if (isDataHidden) {
        hiddenDataRef.current = data
        setRaw(maskData(data))
      } else {
        setRaw(data)
      }
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
    }
  }, [dispatch, state.timeseries.remoteSeries, state.timeseries.availableSeries, isDataHidden, maskData])

  const handleDelete = useCallback((name: string) => {
    deleteDataset(name)
    setSavedDatasets(listDatasets())
  }, [])

  // F0813: Toggle data visibility
  const handleToggleHide = useCallback(() => {
    if (isDataHidden) {
      setRaw(hiddenDataRef.current)
      setIsDataHidden(false)
    } else {
      hiddenDataRef.current = raw
      setRaw(maskData(raw))
      setIsDataHidden(true)
    }
  }, [isDataHidden, raw, maskData])

  return (
    <section className="home-page">
      <h1 className="visually-hidden">Maaş Alım Gücü Hesaplama</h1>
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
          <h3 className="section-header">Gelir Değişimleri<HelpTooltip text="Gelirinizin değiştiği tarihleri ve yeni miktarı girin. Her ay tekrarlamaya gerek yok — sadece değişiklik tarihlerini yazın. Her girdi yeni bir satırda olmalı. Kabul edilen formatlar: GG.AA.YYYY, AA.YYYY, AA-YYYY" /><button type="button" className="data-visibility-toggle" onClick={handleToggleHide} aria-label={isDataHidden ? 'Veriyi göster' : 'Veriyi gizle'} title={isDataHidden ? 'Veriyi göster' : 'Veriyi gizle'}>{isDataHidden ? <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}</button></h3>
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
                readOnly={isDataHidden}
                aria-invalid={valid === false}
              />
            )
          })()}
          <small className="editor-help">
            Formatlar: DD.MM.YYYY | MM.YYYY | MM-YYYY
          </small>
        </div>
        
        <div className="storage-section">
          <h3 className="section-header">Kaydet/Yükle<HelpTooltip text="Verileriniz yalnızca tarayıcınızda saklanır, hiçbir sunucuya gönderilmez." /></h3>
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

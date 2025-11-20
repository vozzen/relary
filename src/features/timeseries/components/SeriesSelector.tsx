import { useAppState, useAppDispatch, actions } from '../../../app/store'
import { getSeriesFriendlyName } from '../../../shared/utils'
import './SeriesSelector.css'

/**
 * Component for selecting which series to display in the chart
 * Uses friendly names for TP.DK.* series (F0605)
 */
export function SeriesSelector() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { availableSeries, selectedSeries } = state.timeseries

  const handleToggle = (code: string) => {
    const currentValue = selectedSeries[code] ?? false
    actions.setSeriesSelection(dispatch, code, !currentValue)
  }

  if (availableSeries.length === 0) {
    return null
  }

  return (
    <div className="series-selector">
      <h3>Select Series to Display</h3>
      <div className="series-checkboxes">
        {availableSeries.map((code) => (
          <label key={code} className="series-checkbox-label">
            <input
              type="checkbox"
              checked={selectedSeries[code] ?? false}
              onChange={() => handleToggle(code)}
            />
            <span>{getSeriesFriendlyName(code)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

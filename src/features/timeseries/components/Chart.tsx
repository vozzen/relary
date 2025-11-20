import type { FC } from 'react'
import { useAppState, useAppDispatch, actions } from '../../../app/store'
import { buildTimeseriesChartData, calculateChartDateRange, getSeriesFriendlyName, generateDerivedSeries, generateInflationSeries, generatePurchasingPowerSeries } from '../../../shared/utils'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import './Chart.css'

/**
 * Custom tooltip formatter to show 2 decimal places (F0607)
 */
const formatTooltipValue = (value: number) => {
  return typeof value === 'number' ? value.toFixed(2) : value
}

/**
 * Timeseries chart using Recharts (F010/F011).
 * Renders user series and remote series with shared X axis.
 * Only displays selected series (F0601).
 * Filters data by date range based on user input (F0602).
 * Each series has its own Y axis (F0604).
 * Legend is clickable to toggle series (F0607).
 */
export const Chart: FC = () => {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { userSeries, remoteSeries, selectedSeries } = state.timeseries
  
  // Handle legend click to toggle series visibility (F0607)
  const handleLegendClick = (data: any) => {
    const dataKey = typeof data.dataKey === 'string' ? data.dataKey : String(data.dataKey)
    if (dataKey) {
      // Get current value - if undefined, it means it's currently selected (default behavior)
      const currentValue = selectedSeries[dataKey] ?? true
      actions.setSeriesSelection(dispatch, dataKey, !currentValue)
    }
  }
  
  // Generate derived series (Gelir(<currency>)) from TP.DK.* series (F0606, F0610)
  const derivedSeries = generateDerivedSeries(userSeries, remoteSeries)
  
  // Generate inflation series from TP.FG.J0 (F0612)
  const inflationSeries = generateInflationSeries(userSeries, remoteSeries)
  
  // Generate purchasing power series from user data and inflation (F0613)
  const purchasingPowerSeries = generatePurchasingPowerSeries(
    userSeries, 
    inflationSeries?.['Enflasyon'] ?? null
  )
  
  // Filter out TP.FG.J0 from remote series (F0612)
  const { 'TP.FG.J0': _removed, ...filteredRemoteSeries } = remoteSeries
  
  // Merge filtered remote, derived, inflation, and purchasing power series
  const allRemoteSeries = { 
    ...filteredRemoteSeries, 
    ...derivedSeries,
    ...(inflationSeries || {}),
    ...(purchasingPowerSeries || {})
  }
  
  // Calculate date range based on user data (F0602)
  const { minDate, maxDate } = calculateChartDateRange(userSeries)
  
  // Build chart data with ALL series (don't filter here, use hide prop on Line instead)
  const allData = buildTimeseriesChartData(userSeries, allRemoteSeries)
  
  // Filter data to only show the calculated date range (F0602)
  const data = allData.filter((row) => {
    const ts = row.ts as number
    return ts >= minDate && ts <= maxDate
  })
  const hasData = data.length > 0
  const remoteKeys = Object.keys(allRemoteSeries)

  return (
    <figure className="timeseries-chart-container" aria-label="Zaman serisi grafiği">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ left: 8, right: 24, top: 10, bottom: 10 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
            />
            {/* Y axis for user series (F0604) */}
            {hasData && (
              <YAxis
                yAxisId="user"
                orientation="left"
                tick={false}
                axisLine={false}
                width={0}
                allowDecimals={false}
                hide={!(selectedSeries['user'] ?? true)}
              />
            )}
            {/* Y axes for remote series - alternate left/right (F0604) */}
            {remoteKeys.map((k, i) => {
              const isSelected = selectedSeries[k] ?? true
              const axisIndex = hasData ? i + 1 : i
              const orientation = axisIndex % 2 === 0 ? 'left' : 'right'
              return (
                <YAxis
                  key={k}
                  yAxisId={k}
                  orientation={orientation}
                  tick={false}
                  axisLine={false}
                  width={0}
                  allowDecimals={false}
                  hide={!isSelected}
                />
              )
            })}
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 12 }}
              formatter={formatTooltipValue}
            />
            <Legend 
              wrapperStyle={{ fontSize: 12, cursor: 'pointer' }} 
              onClick={handleLegendClick}
            />
            {hasData && (
              <Line
                type="monotone"
                dataKey="user"
                yAxisId="user"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={false}
                name="Gelir(₺)"
                hide={!(selectedSeries['user'] ?? true)}
              />
            )}
            {remoteKeys.map((k, i) => {
              const isSelected = selectedSeries[k] ?? true
              return (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  yAxisId={k}
                  strokeWidth={2}
                  stroke={remoteColor(i)}
                  dot={false}
                  isAnimationActive={false}
                  name={getSeriesFriendlyName(k)}
                  hide={!isSelected}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {!hasData && <figcaption className="chart-empty">Henüz veri yok</figcaption>}
    </figure>
  )
}

function remoteColor(i: number): string {
  const palette = ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444']
  return palette[i % palette.length]
}

export default Chart
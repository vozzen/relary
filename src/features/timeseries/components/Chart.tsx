import type { FC } from 'react'
import { useAppState } from '../../../app/store'
import { buildTimeseriesChartData } from '../../../shared/utils'
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
 * Timeseries chart using Recharts (F010/F011).
 * Renders user series and remote series with shared X axis.
 * Only displays selected series (F0601).
 */
export const Chart: FC = () => {
  const state = useAppState()
  const { userSeries, remoteSeries, selectedSeries } = state.timeseries
  
  // Filter remote series to only include selected ones
  const filteredRemoteSeries = Object.keys(remoteSeries).reduce(
    (acc, key) => {
      if (selectedSeries[key]) {
        acc[key] = remoteSeries[key]
      }
      return acc
    },
    {} as Record<string, typeof remoteSeries[string]>
  )
  
  const data = buildTimeseriesChartData(userSeries, filteredRemoteSeries)
  const hasData = data.length > 0
  const remoteKeys = Object.keys(filteredRemoteSeries)

  return (
    <figure className="timeseries-chart-container" aria-label="Zaman serisi grafiği">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ left: 8, right: 24, top: 10, bottom: 10 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#64748b"
              width={50}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {hasData && (
              <Line
                type="monotone"
                dataKey="user"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={false}
                name="Kullanıcı"
              />
            )}
            {remoteKeys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                strokeWidth={2}
                stroke={remoteColor(i)}
                dot={false}
                isAnimationActive={false}
                name={k}
              />
            ))}
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
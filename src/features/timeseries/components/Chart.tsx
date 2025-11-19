import type { FC } from 'react'
import { useAppState } from '../../../app/store'
import './Chart.css'

/**
 * Empty chart frame (F009).
 * Renders axes-only SVG. Future features will plot series lines.
 */
export const Chart: FC = () => {
  const state = useAppState()
  const hasData = state.timeseries.userSeries.length > 0 || Object.values(state.timeseries.remoteSeries).some(s => s.length > 0)
  return (
    <figure className="timeseries-chart-container" aria-label="Zaman serisi grafiği">
      <svg className="timeseries-chart" viewBox="0 0 800 240" preserveAspectRatio="none" aria-label="Boş zaman serisi grafiği">
        <rect x="0" y="0" width="800" height="240" className="chart-frame" />
        {/* Y axis */}
        <line x1="50" y1="10" x2="50" y2="230" className="axis" />
        {/* X axis */}
        <line x1="50" y1="230" x2="790" y2="230" className="axis" />
        {/* Placeholder ticks (few) */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = 230 - i * 50
          return <line key={y} x1="48" y1={y} x2="52" y2={y} className="tick" />
        })}
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 50 + i * 124
          return <line key={x} x1={x} y1="228" x2={x} y2="232" className="tick" />
        })}
      </svg>
      {!hasData && <figcaption className="chart-empty">Henüz veri yok</figcaption>}
    </figure>
  )
}

export default Chart
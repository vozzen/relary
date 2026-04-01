import type { FC } from 'react'
import './HelpTooltip.css'

// F0812: Help tooltip with question mark icon
interface HelpTooltipProps {
  text: string
}

export const HelpTooltip: FC<HelpTooltipProps> = ({ text }) => {
  return (
    <span className="help-tooltip" aria-label={text} role="img">
      <span className="help-tooltip-icon">?</span>
      <span className="help-tooltip-popup">{text}</span>
    </span>
  )
}

import { CLASS_COLORS, CLASS_TEXT_COLOR, DRIVETRAIN_COLORS } from '../../constants/classes'

export function ClassBadge({ cls, className = '' }) {
  if (!cls) return null
  const bg = CLASS_COLORS[cls] ?? '#6b7280'
  const color = CLASS_TEXT_COLOR[cls] ?? '#fff'
  return (
    <span
      style={{ backgroundColor: bg, color }}
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded font-barlow font-bold text-xs leading-none flex-shrink-0 ${className}`}
    >
      {cls}
    </span>
  )
}

export function DrivetrainBadge({ drivetrain, className = '' }) {
  if (!drivetrain) return null
  const color = DRIVETRAIN_COLORS[drivetrain] ?? '#9ca3af'
  return (
    <span
      style={{ color }}
      className={`font-semibold text-xs leading-none flex-shrink-0 ${className}`}
    >
      {drivetrain}
    </span>
  )
}

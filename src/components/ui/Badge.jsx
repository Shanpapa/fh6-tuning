const colors = {
  accent: 'bg-accent/15 text-accent border-accent/30',
  blue:   'bg-blue/15 text-blue border-blue/30',
  green:  'bg-green/15 text-green border-green/30',
  red:    'bg-red/15 text-red border-red/30',
  yellow: 'bg-yellow/15 text-yellow border-yellow/30',
  mid:    'bg-surf3 text-mid border-border',
}

export default function Badge({ color = 'mid', className = '', children }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
        ${colors[color] ?? colors.mid} ${className}
      `}
    >
      {children}
    </span>
  )
}

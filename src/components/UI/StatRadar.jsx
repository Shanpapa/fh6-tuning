import { t } from '../../lib/theme.js'

const AXES = [
  { key: 'stat_speed',        label: 'Speed'    },
  { key: 'stat_braking',      label: 'Braking'  },
  { key: 'stat_handling',     label: 'Handling' },
  { key: 'stat_offroad',      label: 'Off-Road' },
  { key: 'stat_launch',       label: 'Launch'   },
  { key: 'stat_acceleration', label: 'Accel'    },
]

const N     = AXES.length
const CX    = 100
const CY    = 100
const R     = 72   // outer ring radius
const STEPS = 4    // grid rings

function polarToXY(angle, r, cx = CX, cy = CY) {
  // Start at top (−90°), go clockwise
  const rad = (angle - 90) * (Math.PI / 180)
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function statsToPoints(stats, max = 10) {
  return AXES.map((ax, i) => {
    const angle = (360 / N) * i
    const val   = typeof stats?.[ax.key] === 'number' ? stats[ax.key] : 0
    const r     = (Math.min(val, max) / max) * R
    return polarToXY(angle, r)
  })
}

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ') + ' Z'
}

function hasData(stats) {
  if (!stats) return false
  return AXES.some(ax => typeof stats[ax.key] === 'number' && stats[ax.key] > 0)
}

// ── StatRadar ──────────────────────────────────────────────
// base:    background polygon (stock / "your build") — grey
// current: foreground polygon (new build / optimum)  — orange
// size:    SVG display size in px (default 200)
export default function StatRadar({ base, current, size = 200 }) {
  const showBase    = hasData(base)
  const showCurrent = hasData(current)

  if (!showBase && !showCurrent) return null

  const basePts    = statsToPoints(base)
  const currentPts = statsToPoints(current)

  // Label positions (slightly outside the ring)
  const labelR = R + 22

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg
        viewBox="0 0 200 200"
        width={size} height={size}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid rings */}
        {Array.from({ length: STEPS }, (_, i) => {
          const r = R * ((i + 1) / STEPS)
          const pts = AXES.map((_, j) => polarToXY((360 / N) * j, r))
          return (
            <polygon
              key={i}
              points={pts.map(p => p.join(',')).join(' ')}
              fill="none"
              stroke={t.border}
              strokeWidth="0.8"
              opacity="0.6"
            />
          )
        })}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const [x, y] = polarToXY((360 / N) * i, R)
          return (
            <line
              key={i}
              x1={CX} y1={CY} x2={x} y2={y}
              stroke={t.border} strokeWidth="0.8" opacity="0.5"
            />
          )
        })}

        {/* Base polygon (stock / old build) */}
        {showBase && (
          <path
            d={pointsToPath(basePts)}
            fill={`${t.mid}28`}
            stroke={t.mid}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {/* Current polygon (new / optimised) */}
        {showCurrent && (
          <path
            d={pointsToPath(currentPts)}
            fill={`${t.accent}28`}
            stroke={t.accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Axis labels */}
        {AXES.map((ax, i) => {
          const angle  = (360 / N) * i
          const [x, y] = polarToXY(angle, labelR)
          const anchor =
            Math.abs(angle % 360 - 180) < 10 ? 'middle' :
            x < CX - 2 ? 'end' :
            x > CX + 2 ? 'start' : 'middle'

          const curVal  = current?.[ax.key]
          const baseVal = base?.[ax.key]
          const delta   = (showBase && showCurrent && typeof curVal === 'number' && typeof baseVal === 'number')
            ? curVal - baseVal : null
          const deltaColor = delta === null ? t.dim : delta > 0 ? '#4ade80' : delta < 0 ? '#f87171' : t.dim

          return (
            <g key={i}>
              <text
                x={x} y={y - 5}
                textAnchor={anchor}
                fill={t.dim}
                fontSize="10"
                fontFamily="'Space Mono', monospace"
                style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {ax.label}
              </text>
              {/* Show current value */}
              {showCurrent && typeof curVal === 'number' && (
                <text
                  x={x} y={y + 5}
                  textAnchor={anchor}
                  fill={t.accent}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="'Space Mono', monospace"
                >
                  {curVal.toFixed(1)}
                  {delta !== null && delta !== 0 && (
                    <tspan fill={deltaColor} fontSize="9">
                      {delta > 0 ? ` +${delta.toFixed(1)}` : ` ${delta.toFixed(1)}`}
                    </tspan>
                  )}
                </text>
              )}
              {/* If only base */}
              {!showCurrent && showBase && typeof baseVal === 'number' && (
                <text
                  x={x} y={y + 5}
                  textAnchor={anchor}
                  fill={t.mid}
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="'Space Mono', monospace"
                >
                  {baseVal.toFixed(1)}
                </text>
              )}
            </g>
          )
        })}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="2" fill={t.border} />
      </svg>

      {/* Legend */}
      {showBase && showCurrent && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: t.mid, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Before
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 20, height: 2, background: t.accent, borderRadius: 1 }} />
            <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              After
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

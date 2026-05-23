import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { Btn, Spinner } from '../UI/index.jsx'

// ── Stat display config ───────────────────────────────────
const STAT_SECTIONS = [
  {
    label: 'Performance',
    stats: [
      { key: 'power_hp',      label: 'Power',         unit: 'hp',  lowerBetter: false },
      { key: 'torque_nm',     label: 'Torque',        unit: 'Nm',  lowerBetter: false },
      { key: 'weight_kg',     label: 'Weight',        unit: 'kg',  lowerBetter: true  },
      { key: 'top_speed_kmh', label: 'Top Speed',     unit: 'km/h',lowerBetter: false },
      { key: 'accel_0_97',    label: '0–97 km/h',     unit: 's',   lowerBetter: true  },
      { key: 'accel_0_161',   label: '0–161 km/h',    unit: 's',   lowerBetter: true  },
      { key: 'brake_dist_97', label: 'Brake 97→0',    unit: 'm',   lowerBetter: true  },
      { key: 'brake_dist_161',label: 'Brake 161→0',   unit: 'm',   lowerBetter: true  },
    ],
  },
  {
    label: 'In-Game Ratings',
    stats: [
      { key: 'stat_speed',        label: 'Speed',        unit: '', lowerBetter: false },
      { key: 'stat_handling',     label: 'Handling',     unit: '', lowerBetter: false },
      { key: 'stat_acceleration', label: 'Acceleration', unit: '', lowerBetter: false },
      { key: 'stat_launch',       label: 'Launch',       unit: '', lowerBetter: false },
      { key: 'stat_braking',      label: 'Braking',      unit: '', lowerBetter: false },
      { key: 'stat_offroad',      label: 'Off-Road',     unit: '', lowerBetter: false },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100 }

function fmtVal(v, unit) {
  if (v == null) return '—'
  const n = typeof v === 'number' ? round2(v) : parseFloat(v)
  if (isNaN(n)) return '—'
  return unit ? `${n} ${unit}` : String(n)
}

function fmtDelta(d, unit, lowerBetter) {
  if (d == null || d === 0) return null
  const sign  = d > 0 ? '+' : ''
  const color = (d > 0) === !lowerBetter ? t.green : t.red
  return { text: `${sign}${round2(d)}${unit ? ' ' + unit : ''}`, color }
}

// ── Stat row ──────────────────────────────────────────────
function StatRow({ label, base, newVal, unit, lowerBetter }) {
  const delta = (base != null && newVal != null) ? newVal - base : null
  const hasDelta = delta != null && Math.abs(delta) > 0.001
  const fmt = fmtDelta(delta, unit, lowerBetter)

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0', borderBottom: `1px solid ${t.border}22`,
    }}>
      <span style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {hasDelta ? (
          <>
            <span style={{ fontSize: 12, color: t.mid, fontFamily: t.mono }}>
              {fmtVal(base, unit)}
            </span>
            <span style={{ fontSize: 11, color: t.dim }}>→</span>
            <span style={{ fontSize: 12, color: t.text, fontFamily: t.mono, fontWeight: 700 }}>
              {fmtVal(newVal, unit)}
            </span>
            <span style={{ fontSize: 11, fontFamily: t.mono, color: fmt?.color }}>
              {fmt?.text}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: t.mid, fontFamily: t.mono }}>
            {fmtVal(base, unit)}
          </span>
        )}
      </div>
    </div>
  )
}

// ── PI bar ────────────────────────────────────────────────
function PiBar({ current, target }) {
  if (!target) return null
  const pct     = Math.min((current / target) * 100, 100)
  const over    = current > target
  const barColor= over ? t.red : t.green
  const label   = over ? 'OVER LIMIT' : 'OK'
  const labelCol= over ? t.red : t.green

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
      }}>
        <span style={{ fontFamily: t.mono, fontSize: 13, fontWeight: 700, color: over ? t.red : t.text }}>
          PI: {current} / {target}
        </span>
        <span style={{ fontFamily: t.mono, fontSize: 11, color: labelCol, fontWeight: 700 }}>
          {label}
        </span>
      </div>
      <div style={{
        background: t.surf3, borderRadius: 3, height: 6, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: barColor, borderRadius: 3,
          transition: 'width 0.2s, background 0.2s',
        }} />
      </div>
    </div>
  )
}

// ── Part item (available list) ────────────────────────────
function PartItem({ part, installed, onToggle }) {
  const [hover, setHover] = useState(false)
  const piSign = part.pi_change > 0 ? `+${part.pi_change}` : part.pi_change < 0 ? `${part.pi_change}` : '±0'
  const piColor = part.pi_change > 0 ? t.red : part.pi_change < 0 ? t.green : t.dim

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '7px 10px', borderRadius: 4, cursor: 'pointer',
        background: installed ? `${t.accent}14` : hover ? t.surf3 : 'transparent',
        border: `1px solid ${installed ? t.accent + '55' : 'transparent'}`,
        transition: 'all 0.12s', marginBottom: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 14, height: 14, borderRadius: 3, flexShrink: 0,
          border: `2px solid ${installed ? t.accent : t.border}`,
          background: installed ? t.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {installed && <span style={{ fontSize: 9, color: '#000', fontWeight: 900 }}>✓</span>}
        </div>
        <span style={{ fontSize: 13, fontFamily: t.mono, color: installed ? t.text : t.mid }}>
          {part.name}
        </span>
      </div>
      <span style={{ fontSize: 11, fontFamily: t.mono, color: piColor, fontWeight: 700 }}>
        PI {piSign}
      </span>
    </div>
  )
}

// ── Installed part chip ───────────────────────────────────
function InstalledChip({ part, onRemove }) {
  const piSign = part.pi_change > 0 ? `+${part.pi_change}` : part.pi_change < 0 ? `${part.pi_change}` : '±0'
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: t.surf2, border: `1px solid ${t.accent}33`,
      borderRadius: 4, padding: '5px 10px', marginBottom: 4,
    }}>
      <div>
        <span style={{ fontSize: 12, fontFamily: t.mono, color: t.text }}>{part.name}</span>
        <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, marginLeft: 8 }}>
          {part.category}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11, fontFamily: t.mono,
          color: part.pi_change > 0 ? t.red : part.pi_change < 0 ? t.green : t.dim,
          fontWeight: 700,
        }}>
          PI {piSign}
        </span>
        <button
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', color: t.dim, cursor: 'pointer',
            fontSize: 13, padding: '0 2px', lineHeight: 1,
          }}
        >✕</button>
      </div>
    </div>
  )
}

// ── Main UpgradesTab ──────────────────────────────────────
export default function UpgradesTab({ build, car, onPartsChange }) {
  const [allParts,    setAllParts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [installedIds,setInstalledIds]= useState(
    Array.isArray(build.installed_parts) ? build.installed_parts : []
  )
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  // Load all parts for this car
  useEffect(() => {
    if (!car?.id) return
    setLoading(true)
    supabase.from('car_parts')
      .select('*')
      .eq('car_id', car.id)
      .order('category')
      .then(({ data }) => { setAllParts(data || []); setLoading(false) })
  }, [car?.id])

  // Group parts by category
  const grouped = useMemo(() => {
    const map = {}
    allParts.forEach(p => {
      const cat = p.category || 'Other'
      if (!map[cat]) map[cat] = []
      map[cat].push(p)
    })
    return map
  }, [allParts])

  const installedParts = useMemo(
    () => allParts.filter(p => installedIds.includes(p.id)),
    [allParts, installedIds]
  )

  // Compute cumulative stats
  const { baseStats, newStats, currentPi } = useMemo(() => {
    const base = car?.base_stats || {}
    const allKeys = new Set([
      ...Object.keys(base),
      ...installedParts.flatMap(p => Object.keys(p.effects || {})),
    ])
    const next = {}
    allKeys.forEach(k => {
      const b = base[k]
      const delta = installedParts.reduce((acc, p) => {
        const v = p.effects?.[k]
        return typeof v === 'number' ? acc + v : acc
      }, 0)
      if (typeof b === 'number') next[k] = round2(b + delta)
      else if (delta !== 0) next[k] = round2(delta)
    })
    const basePi  = car?.stock_pi ?? 0
    const piDelta = installedParts.reduce((acc, p) => acc + (p.pi_change || 0), 0)
    return { baseStats: base, newStats: next, currentPi: basePi + piDelta }
  }, [car, installedParts])

  const toggle = (id) => {
    setInstalledIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('builds')
      .update({ installed_parts: installedIds, updated_at: new Date().toISOString() })
      .eq('id', build.id)
    setSaving(false); setSaved(true)
    onPartsChange?.(installedIds)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
  )

  if (allParts.length === 0) return (
    <div style={{
      background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
      padding: 48, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
    }}>
      No parts in catalog for this car yet
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      {/* LEFT — available parts */}
      <div style={{
        background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
        padding: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)',
      }}>
        <div style={{
          fontSize: 11, fontFamily: t.mono, color: t.dim,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
        }}>
          Available Parts
        </div>
        {Object.entries(grouped).map(([cat, parts]) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontFamily: t.mono, color: t.accent,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              marginBottom: 6, paddingBottom: 4,
              borderBottom: `1px solid ${t.border}`,
            }}>
              {cat}
            </div>
            {parts.map(p => (
              <PartItem
                key={p.id} part={p}
                installed={installedIds.includes(p.id)}
                onToggle={() => toggle(p.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* RIGHT — installed + stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Installed parts list */}
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16,
        }}>
          <div style={{
            fontSize: 11, fontFamily: t.mono, color: t.dim,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            Installed ({installedParts.length})
          </div>
          {installedParts.length === 0 ? (
            <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono, padding: '8px 0' }}>
              Click parts on the left to install
            </div>
          ) : (
            installedParts.map(p => (
              <InstalledChip key={p.id} part={p} onRemove={() => toggle(p.id)} />
            ))
          )}

          {/* PI bar */}
          <PiBar current={currentPi} target={build.target_pi} />

          {/* Save */}
          <div style={{ marginTop: 12 }}>
            <Btn onClick={save} disabled={saving} full>
              {saving ? '…' : saved ? '✓ Saved' : 'Save Parts'}
            </Btn>
          </div>
        </div>

        {/* Stat changes */}
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: 16,
          overflowY: 'auto', maxHeight: 'calc(100vh - 480px)',
        }}>
          <div style={{
            fontSize: 11, fontFamily: t.mono, color: t.dim,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            Stat Changes
          </div>
          {STAT_SECTIONS.map(sec => (
            <div key={sec.label} style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 10, fontFamily: t.mono, color: t.accent,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: 4, paddingBottom: 3,
                borderBottom: `1px solid ${t.border}`,
              }}>
                {sec.label}
              </div>
              {sec.stats.map(({ key, label, unit, lowerBetter }) => (
                <StatRow
                  key={key} label={label}
                  base={baseStats[key] ?? null}
                  newVal={newStats[key] ?? baseStats[key] ?? null}
                  unit={unit} lowerBetter={lowerBetter}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { Btn, Spinner, InfoTooltip } from '../UI/index.jsx'
import StatRadar from '../UI/StatRadar.jsx'
import { useDescriptions } from '../../lib/useDescriptions.js'
import { useIsMobile } from '../../lib/useIsMobile.js'

// ── Stat display config ───────────────────────────────────
const STAT_SECTIONS = [
  {
    label: 'Car Stats',
    stats: [
      { key: 'power_hp',       label: 'Power',         unit: 'hp',   lowerBetter: false },
      { key: 'torque_nm',      label: 'Torque',        unit: 'Nm',   lowerBetter: false },
      { key: 'weight_kg',      label: 'Weight',        unit: 'kg',   lowerBetter: true  },
      { key: 'displacement_l', label: 'Displacement',  unit: 'L',    lowerBetter: false },
      { key: 'top_speed_kmh',  label: 'Top Speed',     unit: 'km/h', lowerBetter: false },
      { key: 'accel_0_100',    label: '0–100 km/h',    unit: 's',    lowerBetter: true  },
      { key: 'accel_0_97',     label: '0–97 km/h',     unit: 's',    lowerBetter: true  },
      { key: 'accel_0_161',    label: '0–161 km/h',    unit: 's',    lowerBetter: true  },
      { key: 'brake_dist_97',  label: 'Brake 97→0',    unit: 'm',    lowerBetter: true  },
      { key: 'brake_dist_161', label: 'Brake 161→0',   unit: 'm',    lowerBetter: true  },
      { key: 'lateral_g_97',   label: 'Lateral G 97',  unit: 'G',    lowerBetter: false },
      { key: 'lateral_g_193',  label: 'Lateral G 193', unit: 'G',    lowerBetter: false },
    ],
  },
  {
    label: 'PI Ratings (0–10)',
    stats: [
      { key: 'stat_speed',        label: 'Speed (PI)',        unit: '', lowerBetter: false },
      { key: 'stat_handling',     label: 'Handling (PI)',     unit: '', lowerBetter: false },
      { key: 'stat_acceleration', label: 'Acceleration (PI)', unit: '', lowerBetter: false },
      { key: 'stat_launch',       label: 'Launch (PI)',       unit: '', lowerBetter: false },
      { key: 'stat_braking',      label: 'Braking (PI)',      unit: '', lowerBetter: false },
      { key: 'stat_offroad',      label: 'Off-Road (PI)',     unit: '', lowerBetter: false },
    ],
  },
  {
    label: 'Aero & Balance',
    stats: [
      { key: 'aero_efficiency', label: 'Aero Efficiency', unit: '', lowerBetter: false },
      { key: 'aero_balance',    label: 'Aero Balance',    unit: '', lowerBetter: false },
      { key: 'mech_balance',    label: 'Mech. Balance',   unit: '', lowerBetter: false },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100 }

// Convert display name to description key slug
function toDescKey(prefix, name) {
  const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return `${prefix}${slug}`
}

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
  const delta    = (base != null && newVal != null) ? newVal - base : null
  const hasDelta = delta != null && Math.abs(delta) > 0.001
  const fmt      = fmtDelta(delta, unit, lowerBetter)
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: `1px solid ${t.border}33`,
    }}>
      <span style={{ fontSize: 13, color: t.mid, fontFamily: t.mono }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {hasDelta ? (
          <>
            <span style={{ fontSize: 13, color: t.dim,  fontFamily: t.mono }}>{fmtVal(base, unit)}</span>
            <span style={{ fontSize: 11, color: t.dim }}>→</span>
            <span style={{ fontSize: 13, color: t.text, fontFamily: t.mono, fontWeight: 700 }}>{fmtVal(newVal, unit)}</span>
            <span style={{ fontSize: 12, fontFamily: t.mono, color: fmt?.color }}>{fmt?.text}</span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: t.mid, fontFamily: t.mono }}>{fmtVal(base, unit)}</span>
        )}
      </div>
    </div>
  )
}

// ── PI bar ────────────────────────────────────────────────
function PiBar({ current, target }) {
  if (!target) return null
  const pct      = Math.min((current / target) * 100, 100)
  const over     = current > target
  const barColor = over ? t.red : t.green
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: t.mono, fontSize: 13, fontWeight: 700, color: over ? t.red : t.text }}>
          PI: {current} / {target}
        </span>
        <span style={{ fontFamily: t.mono, fontSize: 11, color: over ? t.red : t.green, fontWeight: 700 }}>
          {over ? 'OVER LIMIT' : 'OK'}
        </span>
      </div>
      <div style={{ background: t.surf3, borderRadius: 3, height: 6, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: barColor,
          borderRadius: 3, transition: 'width 0.2s, background 0.2s',
        }} />
      </div>
    </div>
  )
}

// ── Part item ─────────────────────────────────────────────
function PartItem({ part, installed, onToggle }) {
  const [hover, setHover] = useState(false)
  const piSign  = part.pi_change > 0 ? `+${part.pi_change}` : part.pi_change < 0 ? `${part.pi_change}` : '±0'
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
  const piSign  = part.pi_change > 0 ? `+${part.pi_change}` : part.pi_change < 0 ? `${part.pi_change}` : '±0'
  const piColor = part.pi_change > 0 ? t.red : part.pi_change < 0 ? t.green : t.dim
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: t.surf2, border: `1px solid ${t.accent}33`,
      borderRadius: 4, padding: '5px 10px', marginBottom: 4,
    }}>
      <div>
        <span style={{ fontSize: 12, fontFamily: t.mono, color: t.text }}>{part.name}</span>
        <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, marginLeft: 8 }}>
          {part.subcategory || part.category}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: t.mono, color: piColor, fontWeight: 700 }}>PI {piSign}</span>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: t.dim, cursor: 'pointer', fontSize: 13, padding: '0 2px', lineHeight: 1 }}
        >✕</button>
      </div>
    </div>
  )
}

// ── Grouped parts panel ───────────────────────────────────
function AvailablePartsPanel({ grouped, installedIds, onToggle, descs, showTooltips }) {
  const [collapsed, setCollapsed] = useState({})

  const toggleCat = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }))

  return (
    <div style={{
      background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
      padding: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)',
    }}>
      <div style={{
        fontSize: 12, fontFamily: t.mono, color: t.mid,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        Available Parts
      </div>

      {Object.entries(grouped).map(([cat, subcats]) => {
        const catKey  = toDescKey('parts_', cat)
        const catDesc = descs[catKey]
        const isCatCollapsed = collapsed[cat]

        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            {/* Main category header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 4px', marginBottom: isCatCollapsed ? 0 : 6,
              borderBottom: `1px solid ${t.accent}44`, cursor: 'pointer',
            }}
              onClick={() => toggleCat(cat)}
            >
              <span style={{
                fontSize: 11, fontFamily: t.mono, color: t.accent,
                textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, flex: 1,
              }}>
                {cat}
              </span>
              {catDesc && showTooltips && (
                <InfoTooltip title={catDesc.title} body={catDesc.body} show />
              )}
              <span style={{ fontSize: 10, color: t.dim, marginLeft: 4 }}>
                {isCatCollapsed ? '▸' : '▾'}
              </span>
            </div>

            {/* Subcategories */}
            {!isCatCollapsed && Object.entries(subcats).map(([subcat, parts]) => {
              const subcatKey  = toDescKey('parts_', subcat)
              const subcatDesc = descs[subcatKey]
              const isSubCollapsed = collapsed[`${cat}__${subcat}`]

              return (
                <div key={subcat} style={{ marginBottom: 8, paddingLeft: 10 }}>
                  {/* Subcategory header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '3px 4px', marginBottom: isSubCollapsed ? 0 : 4,
                      borderBottom: `1px solid ${t.border}`, cursor: 'pointer',
                    }}
                    onClick={() => toggleCat(`${cat}__${subcat}`)}
                  >
                    <span style={{
                      fontSize: 10, fontFamily: t.mono, color: t.mid,
                      textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1,
                    }}>
                      {subcat}
                    </span>
                    {subcatDesc && showTooltips && (
                      <InfoTooltip title={subcatDesc.title} body={subcatDesc.body} show />
                    )}
                    <span style={{ fontSize: 9, color: t.dim, marginLeft: 4 }}>
                      {isSubCollapsed ? '▸' : '▾'}
                    </span>
                  </div>

                  {/* Parts */}
                  {!isSubCollapsed && parts.map(p => (
                    <PartItem
                      key={p.id} part={p}
                      installed={installedIds.includes(p.id)}
                      onToggle={() => onToggle(p.id)}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Main UpgradesTab ──────────────────────────────────────
export default function UpgradesTab({ build, car, onPartsChange, onPiChange }) {
  const isMobile = useIsMobile()
  const [allParts,     setAllParts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [installedIds, setInstalledIds] = useState(
    Array.isArray(build.installed_parts) ? build.installed_parts : []
  )
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [showTooltips, setShowTooltips] = useState(true)
  const descs = useDescriptions()

  useEffect(() => {
    if (!car?.id) return
    setLoading(true)
    supabase.from('car_parts').select('*').eq('car_id', car.id)
      .order('category').order('subcategory').order('name')
      .then(({ data }) => { setAllParts(data || []); setLoading(false) })
  }, [car?.id])

  // Group: category → subcategory → parts[]
  const grouped = useMemo(() => {
    const map = {}
    allParts.forEach(p => {
      const cat    = p.category    || 'Other'
      const subcat = p.subcategory || 'General'
      if (!map[cat]) map[cat] = {}
      if (!map[cat][subcat]) map[cat][subcat] = []
      map[cat][subcat].push(p)
    })
    return map
  }, [allParts])

  const installedParts = useMemo(
    () => allParts.filter(p => installedIds.includes(p.id)),
    [allParts, installedIds]
  )

  const { baseStats, newStats, currentPi } = useMemo(() => {
    const base = car?.base_stats || {}
    const allKeys = new Set([
      ...Object.keys(base),
      ...installedParts.flatMap(p => Object.keys(p.effects || {})),
    ])
    const next = {}
    allKeys.forEach(k => {
      const b     = base[k]
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

  // Notify parent of PI changes
  useEffect(() => { onPiChange?.(currentPi) }, [currentPi])

  const toggle = (id) => {
    setInstalledIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('builds')
      .update({
        installed_parts: installedIds,
        current_pi: currentPi,
        updated_at: new Date().toISOString(),
      })
      .eq('id', build.id)
    setSaving(false); setSaved(true)
    onPartsChange?.(installedParts)
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
    <div>
      {/* Tooltip toggle */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginBottom: 10,
      }}>
        <button
          onClick={() => setShowTooltips(p => !p)}
          style={{
            background: showTooltips ? `${t.accent}18` : 'transparent',
            border: `1px solid ${showTooltips ? t.accent + '55' : t.border}`,
            color: showTooltips ? t.accent : t.dim,
            borderRadius: 4, padding: '5px 10px', fontSize: 10,
            fontFamily: t.mono, cursor: 'pointer', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {showTooltips ? 'ℹ ON' : 'ℹ OFF'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* LEFT — available parts */}
        <AvailablePartsPanel
          grouped={grouped}
          installedIds={installedIds}
          onToggle={toggle}
          descs={descs}
          showTooltips={showTooltips}
        />

        {/* RIGHT — installed + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Installed */}
          <div style={{
            background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16,
          }}>
            <div style={{
              fontSize: 12, fontFamily: t.mono, color: t.mid,
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
            <PiBar current={currentPi} target={build.target_pi} />
            <div style={{ marginTop: 12 }}>
              <Btn onClick={save} disabled={saving} full>
                {saving ? '…' : saved ? '✓ Saved' : 'Save Parts'}
              </Btn>
            </div>
          </div>

          {/* Radar + Stat changes */}
          <div style={{
            background: t.surf, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: 16,
            overflowY: 'auto', maxHeight: 'calc(100vh - 480px)', minHeight: 200,
          }}>
            <div style={{
              fontSize: 12, fontFamily: t.mono, color: t.mid,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
            }}>
              Stat Changes
            </div>
            {/* Radar centered */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <StatRadar base={baseStats} current={newStats} size={200} />
            </div>

            {/* All stat sections */}
            {STAT_SECTIONS.map(sec => (
              <div key={sec.label} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, fontFamily: t.mono, color: t.accent,
                  textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700,
                  marginBottom: 6, paddingBottom: 4,
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
    </div>
  )
}

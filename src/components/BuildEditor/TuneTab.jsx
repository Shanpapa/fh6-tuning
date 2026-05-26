import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { PSI, COMPOUNDS } from '../../lib/constants.js'
import { calcBaselineTune, normaliseGoal } from '../../lib/tuning.js'
import { Btn, HR, InfoTooltip, TuneSlider } from '../UI/index.jsx'
import { useDescriptions } from '../../lib/useDescriptions.js'

function round1(n) { return Math.round(n * 10) / 10 }

function getActiveCompound(installedParts, carStockCompound) {
  // 1. Check installed tire parts first
  for (const p of (installedParts || [])) {
    const ct = p.effects?.compound_type
    if (ct && COMPOUNDS.includes(ct)) return ct
  }
  // 2. Fall back to car's stock compound from tyre_compound_stock column
  if (carStockCompound) {
    const slug = carStockCompound.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    if (COMPOUNDS.includes(slug)) return slug
  }
  return 'street'
}

// ── Tune section wrapper ───────────────────────────────────
function TuneSection({ title, descKey, descs, showTooltips, children }) {
  const desc = descs?.[descKey]
  return (
    <div style={{
      background: t.surf, border: `1px solid ${t.border}`,
      borderRadius: 8, padding: 18, marginBottom: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{
          fontSize: 11, fontFamily: t.mono, color: t.accent,
          textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700,
        }}>
          {title}
        </div>
        {desc && <InfoTooltip title={desc.title} body={desc.body} show={showTooltips} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </div>
  )
}

const EMPTY_TUNE = {
  tire_pressure_f: 1.9, tire_pressure_r: 1.9,
  camber_f: -1.0, camber_r: -0.5,
  toe_f: 0.0,     toe_r: 0.0,
  caster: 6.0,                   // FH6: 5.5–6.5°
  spring_rate_f: 1, spring_rate_r: 1,  // min value so slider doesn't go negative
  bump_f: 1.0, bump_r: 1.0,
  rebound_f: 1.5, rebound_r: 1.5,
  arb_f: 5.0, arb_r: 5.0,
  diff_accel: 50, diff_decel: 30,  // FH6 RWD defaults
  awd_center: 75,
  aero_front: 0, aero_rear: 0,  // balance target ~0.50
  final_drive: 3.85,
  gear_count: 6,
  gear_1: 3.20, gear_2: 2.19, gear_3: 1.59,
  gear_4: 1.19, gear_5: 0.91, gear_6: 0.72,
  gear_7: null, gear_8: null, gear_9: null, gear_10: null,
}

export default function TuneTab({ build, car, installedParts }) {
  const [tune,         setTune]         = useState({ ...EMPTY_TUNE, ...(build.tune || {}) })
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [genMsg,       setGenMsg]       = useState('')
  const [showTooltips, setShowTooltips] = useState(true)
  const descs = useDescriptions()

  const isAWD    = car?.stock_drivetrain === 'AWD'
  const gearCount = tune.gear_count || 6

  const activeCompound = useMemo(
    () => getActiveCompound(installedParts, car?.tyre_compound_stock),
    [installedParts, car?.tyre_compound_stock]
  )

  const set = (key) => (val) => {
    setTune(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  const generate = () => {
    const base    = car?.base_stats || {}
    const effects = (installedParts || []).reduce((acc, p) => {
      Object.entries(p.effects || {}).forEach(([k, v]) => {
        if (typeof v === 'number') acc[k] = (acc[k] || 0) + v
      })
      return acc
    }, {})

    const power_hp  = round1((base.power_hp  || 200) + (effects.power_hp  || 0))
    const weight_kg = round1((base.weight_kg || 1400) + (effects.weight_kg || 0))
    // front_weight_pct: base from car column + delta from installed parts effects
    const rawFront = car?.front_weight_pct
    const baseFront = rawFront ? (rawFront > 1 ? rawFront / 100 : rawFront) : 0.52
    const frontDelta = (installedParts || []).reduce((acc, p) => {
      const v = p.effects?.front_weight_pct
      return typeof v === 'number' ? acc + v : acc
    }, 0)
    // delta is in % points (e.g. -2 means 2% forward), convert to fraction
    const front_pct = Math.max(0.3, Math.min(0.7, baseFront + frontDelta / 100))
    const pi        = build.target_pi || car?.stock_pi || 500
    const drivetrain = car?.stock_drivetrain || 'RWD'

    const baseline = calcBaselineTune({
      weight_kg, front_pct, pi,
      compound: activeCompound,
      drivetrain, stock_drivetrain: drivetrain,
      power_hp, goal: normaliseGoal(build.goal),
    })

    // Don't overwrite gear_count — user may have set it manually
    const { gear_count, ...baselineWithoutGears } = baseline
    setTune(prev => ({ ...prev, ...baselineWithoutGears }))
    const frontNote = rawFront ? '' : ' · front weight unknown (52% assumed)'
    setGenMsg(`Generated · ${activeCompound} · ${power_hp} hp · ${weight_kg} kg${frontNote}`)
    setSaved(false)
    setTimeout(() => setGenMsg(''), 5000)
  }

  const save = async () => {
    setSaving(true)
    await supabase.from('builds')
      .update({ tune, updated_at: new Date().toISOString() })
      .eq('id', build.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: t.surf2, border: `1px solid ${t.border}`,
        borderRadius: 6, padding: '10px 16px', marginBottom: 16, gap: 12,
      }}>
        <div>
          <span style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}>Active compound: </span>
          <span style={{ fontSize: 12, color: t.accent, fontFamily: t.mono, fontWeight: 700, textTransform: 'uppercase' }}>
            {activeCompound}
          </span>
          <span style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}> · {PSI[activeCompound]} bar</span>
          {genMsg && (
            <div style={{ fontSize: 11, color: t.green, fontFamily: t.mono, marginTop: 3 }}>✓ {genMsg}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <Btn onClick={generate}>⚡ Generate Baseline</Btn>
        </div>
      </div>

      {/* ── Tires ── */}
      {/* Warning if baseline not generated yet */}
      {(tune.spring_rate_f <= 1 && tune.spring_rate_r <= 1) && (
        <div style={{
          background: `${t.yellow}14`, border: `1px solid ${t.yellow}44`,
          borderRadius: 6, padding: '10px 16px', marginBottom: 12,
          fontSize: 12, fontFamily: t.mono, color: t.yellow,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠</span>
          <span>No baseline generated yet — click <strong>⚡ Generate Baseline</strong> to calculate starting values from your car data.</span>
        </div>
      )}

      <TuneSection title="Tires" descKey="tune_tires" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Pressure Front" value={tune.tire_pressure_f} onChange={set('tire_pressure_f')} min={1.0} max={3.0} step={0.1} unit=" bar" />
        <TuneSlider label="Pressure Rear"  value={tune.tire_pressure_r} onChange={set('tire_pressure_r')} min={1.0} max={3.0} step={0.1} unit=" bar" />
      </TuneSection>

      {/* ── Alignment ── */}
      <TuneSection title="Alignment" descKey="tune_alignment" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Camber Front" value={tune.camber_f} onChange={set('camber_f')} min={-5} max={5} step={0.1} unit="°" />
        <TuneSlider label="Camber Rear"  value={tune.camber_r} onChange={set('camber_r')} min={-5} max={5} step={0.1} unit="°" />
        <TuneSlider label="Toe Front"    value={tune.toe_f}    onChange={set('toe_f')}    min={-3} max={3} step={0.1} unit="°" />
        <TuneSlider label="Toe Rear"     value={tune.toe_r}    onChange={set('toe_r')}    min={-3} max={3} step={0.1} unit="°" />
        <TuneSlider label="Caster"       value={tune.caster}   onChange={set('caster')}   min={1}  max={7} step={0.1} unit="°" highlight />
      </TuneSection>

      {/* ── Springs & Dampers ── */}
      <TuneSection title="Springs & Dampers" descKey="tune_springs" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Spring Rate Front" value={tune.spring_rate_f} onChange={set('spring_rate_f')} min={1} max={999} step={1} unit=" N/mm" highlight />
        <TuneSlider label="Spring Rate Rear"  value={tune.spring_rate_r} onChange={set('spring_rate_r')} min={1} max={999} step={1} unit=" N/mm" highlight />
        <TuneSlider label="Bump Front"        value={tune.bump_f}        onChange={set('bump_f')}        min={1} max={20}  step={0.1} />
        <TuneSlider label="Bump Rear"         value={tune.bump_r}        onChange={set('bump_r')}        min={1} max={20}  step={0.1} />
        <TuneSlider label="Rebound Front"     value={tune.rebound_f}     onChange={set('rebound_f')}     min={1} max={20}  step={0.1} highlight />
        <TuneSlider label="Rebound Rear"      value={tune.rebound_r}     onChange={set('rebound_r')}     min={1} max={20}  step={0.1} highlight />
      </TuneSection>

      {/* ── ARB ── */}
      <TuneSection title="Anti-Roll Bars" descKey="tune_arb" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="ARB Front" value={tune.arb_f} onChange={set('arb_f')} min={1} max={65} step={0.1} />
        <TuneSlider label="ARB Rear"  value={tune.arb_r} onChange={set('arb_r')} min={1} max={65} step={0.1} />
      </TuneSection>

      {/* ── Diff ── */}
      <TuneSection title={isAWD ? 'Differential (AWD)' : 'Differential'} descKey="tune_diff" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Acceleration" value={tune.diff_accel} onChange={set('diff_accel')} min={0} max={100} step={1} unit="%" highlight />
        <TuneSlider label="Deceleration" value={tune.diff_decel} onChange={set('diff_decel')} min={0} max={100} step={1} unit="%" />
        {isAWD && (
          <TuneSlider label="Center (rear %)" value={tune.awd_center} onChange={set('awd_center')} min={50} max={100} step={1} unit="%" highlight />
        )}
      </TuneSection>

      {/* ── Aero ── */}
      <TuneSection title="Aero" descKey="tune_aero" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Front Downforce" value={tune.aero_front} onChange={set('aero_front')} min={0} max={1000} step={1} />
        <TuneSlider label="Rear Downforce"  value={tune.aero_rear}  onChange={set('aero_rear')}  min={0} max={1000} step={1} />
      </TuneSection>

      {/* ── Gearing ── */}
      <TuneSection title="Gearing" descKey="tune_final_drive" descs={descs} showTooltips={showTooltips}>
        <TuneSlider label="Final Drive" value={tune.final_drive} onChange={set('final_drive')} min={1.50} max={6.00} step={0.01} highlight />
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
          }}>
            <span style={{ fontSize: 10, color: t.dim, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Individual Gears
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => set('gear_count')(Math.max(1, gearCount - 1))}
                disabled={gearCount <= 1}
                style={{
                  background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
                  borderRadius: 3, width: 22, height: 22, cursor: 'pointer',
                  fontFamily: t.mono, fontSize: 14, lineHeight: 1,
                  opacity: gearCount <= 1 ? 0.4 : 1,
                }}
              >−</button>
              <span style={{ fontSize: 12, fontFamily: t.mono, color: t.mid, minWidth: 20, textAlign: 'center' }}>
                {gearCount}
              </span>
              <button
                onClick={() => set('gear_count')(Math.min(10, gearCount + 1))}
                disabled={gearCount >= 10}
                style={{
                  background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
                  borderRadius: 3, width: 22, height: 22, cursor: 'pointer',
                  fontFamily: t.mono, fontSize: 14, lineHeight: 1,
                  opacity: gearCount >= 10 ? 0.4 : 1,
                }}
              >+</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Array.from({ length: gearCount }, (_, i) => i + 1).map(n => (
              <TuneSlider
                key={n}
                label={`Gear ${n}`}
                value={tune[`gear_${n}`] ?? null}
                onChange={set(`gear_${n}`)}
                min={0.50} max={5.00} step={0.01}
              />
            ))}
          </div>
        </div>
      </TuneSection>

      <HR />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={save} disabled={saving} full>
          {saving ? '…' : saved ? '✓ Saved' : 'Save Tune'}
        </Btn>
      </div>
    </div>
  )
}

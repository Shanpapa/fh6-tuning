import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { PSI, COMPOUNDS } from '../../lib/constants.js'
import { calcBaselineTune } from '../../lib/tuning.js'
import { Btn, HR, InfoTooltip } from '../UI/index.jsx'
import { useDescriptions } from '../../lib/useDescriptions.js'

function round1(n) { return Math.round(n * 10) / 10 }

function getActiveCompound(installedParts) {
  for (const p of (installedParts || [])) {
    const ct = p.effects?.compound_type
    if (ct && COMPOUNDS.includes(ct)) return ct
  }
  return 'street'
}

// ── Tune field ─────────────────────────────────────────────
function TuneField({ label, value, onChange, step = 0.1, min, max, unit, highlight }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontSize: 11, fontFamily: t.mono, color: t.mid,
        textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number" value={value ?? ''} step={step} min={min} max={max}
          onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
          style={{
            background: highlight ? `${t.accent}14` : t.surf3,
            border: `1px solid ${highlight ? t.accent + '55' : t.border}`,
            color: t.text, padding: '7px 10px', borderRadius: 4,
            fontSize: 14, fontFamily: t.mono, width: 90, outline: 'none',
          }}
        />
        {unit && (
          <span style={{ fontSize: 12, color: t.mid, fontFamily: t.mono }}>{unit}</span>
        )}
      </div>
    </div>
  )
}

// ── Tune section ───────────────────────────────────────────
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
        {desc && (
          <InfoTooltip title={desc.title} body={desc.body} show={showTooltips} />
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {children}
      </div>
    </div>
  )
}

const EMPTY_TUNE = {
  tire_pressure_f: 1.9, tire_pressure_r: 1.9,
  camber_f: -1.0,  camber_r: -0.5,
  toe_f: 0.0,      toe_r: 0.2,
  caster: 7.0,
  spring_rate_f: 0, spring_rate_r: 0,
  bump_f: 0, bump_r: 0,
  rebound_f: 0, rebound_r: 0,
  arb_f: 5.0, arb_r: 5.0,
  diff_accel: 55, diff_decel: 15,
  awd_center: 75,
  aero_front: 0, aero_rear: 0,
  final_drive: 3.85,
}

export default function TuneTab({ build, car, installedParts }) {
  const [tune,         setTune]         = useState({ ...EMPTY_TUNE, ...(build.tune || {}) })
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [genMsg,       setGenMsg]       = useState('')
  const [showTooltips, setShowTooltips] = useState(true)
  const descs = useDescriptions()

  const isAWD = car?.stock_drivetrain === 'AWD'

  const activeCompound = useMemo(
    () => getActiveCompound(installedParts),
    [installedParts]
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
    const front_pct = base.mech_balance || 0.52
    const pi        = build.target_pi || car?.stock_pi || 500
    const drivetrain = car?.stock_drivetrain || 'RWD'

    const baseline = calcBaselineTune({
      weight_kg, front_pct, pi,
      compound: activeCompound,
      drivetrain, stock_drivetrain: drivetrain,
      power_hp, goal: build.goal || 'race',
    })

    setTune(prev => ({ ...prev, ...baseline }))
    setGenMsg(`Generated · ${activeCompound} · ${power_hp} hp · ${weight_kg} kg`)
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
      {/* Header bar */}
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
          {/* Tooltip toggle */}
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
            title="Toggle section descriptions"
          >
            {showTooltips ? 'ℹ ON' : 'ℹ OFF'}
          </button>
          <Btn onClick={generate}>⚡ Generate Baseline</Btn>
        </div>
      </div>

      <TuneSection title="Tires" descKey="tune_tires" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Pressure F" value={tune.tire_pressure_f} onChange={set('tire_pressure_f')} step={0.1} min={1.0} max={3.0} unit="bar" />
        <TuneField label="Pressure R" value={tune.tire_pressure_r} onChange={set('tire_pressure_r')} step={0.1} min={1.0} max={3.0} unit="bar" />
      </TuneSection>

      <TuneSection title="Alignment" descKey="tune_alignment" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Camber F"  value={tune.camber_f}  onChange={set('camber_f')}  step={0.1} min={-5} max={5}  unit="°" />
        <TuneField label="Camber R"  value={tune.camber_r}  onChange={set('camber_r')}  step={0.1} min={-5} max={5}  unit="°" />
        <TuneField label="Toe F"     value={tune.toe_f}     onChange={set('toe_f')}     step={0.1} min={-3} max={3}  unit="°" />
        <TuneField label="Toe R"     value={tune.toe_r}     onChange={set('toe_r')}     step={0.1} min={-3} max={3}  unit="°" />
        <TuneField label="Caster"    value={tune.caster}    onChange={set('caster')}    step={0.1} min={1}  max={7}  unit="°" highlight />
      </TuneSection>

      <TuneSection title="Springs & Dampers" descKey="tune_springs" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Spring F"  value={tune.spring_rate_f} onChange={set('spring_rate_f')} step={1}   min={1}  max={999} unit="N/mm" highlight />
        <TuneField label="Spring R"  value={tune.spring_rate_r} onChange={set('spring_rate_r')} step={1}   min={1}  max={999} unit="N/mm" highlight />
        <TuneField label="Bump F"    value={tune.bump_f}        onChange={set('bump_f')}        step={0.1} min={1}  max={20}  />
        <TuneField label="Bump R"    value={tune.bump_r}        onChange={set('bump_r')}        step={0.1} min={1}  max={20}  />
        <TuneField label="Rebound F" value={tune.rebound_f}     onChange={set('rebound_f')}     step={0.1} min={1}  max={20}  highlight />
        <TuneField label="Rebound R" value={tune.rebound_r}     onChange={set('rebound_r')}     step={0.1} min={1}  max={20}  highlight />
      </TuneSection>

      <TuneSection title="Anti-Roll Bars" descKey="tune_arb" descs={descs} showTooltips={showTooltips}>
        <TuneField label="ARB F" value={tune.arb_f} onChange={set('arb_f')} step={0.1} min={1} max={65} />
        <TuneField label="ARB R" value={tune.arb_r} onChange={set('arb_r')} step={0.1} min={1} max={65} />
      </TuneSection>

      <TuneSection title={isAWD ? 'Differential (AWD)' : 'Differential'} descKey="tune_diff" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Accel %" value={tune.diff_accel} onChange={set('diff_accel')} step={1} min={0} max={100} unit="%" highlight />
        <TuneField label="Decel %" value={tune.diff_decel} onChange={set('diff_decel')} step={1} min={0} max={100} unit="%" />
        {isAWD && (
          <TuneField label="Center rear %" value={tune.awd_center} onChange={set('awd_center')} step={1} min={50} max={100} unit="%" highlight />
        )}
      </TuneSection>

      <TuneSection title="Aero" descKey="tune_aero" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Front" value={tune.aero_front} onChange={set('aero_front')} step={1} min={0} max={1000} />
        <TuneField label="Rear"  value={tune.aero_rear}  onChange={set('aero_rear')}  step={1} min={0} max={1000} />
      </TuneSection>

      <TuneSection title="Final Drive" descKey="tune_final_drive" descs={descs} showTooltips={showTooltips}>
        <TuneField label="Final Drive" value={tune.final_drive} onChange={set('final_drive')} step={0.01} min={1.5} max={6.0} highlight />
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

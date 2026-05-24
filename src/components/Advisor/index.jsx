import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { GOALS, GOAL_INFO, GOAL_COLORS, classFromPi } from '../../lib/constants.js'
import { optimize } from '../../lib/optimizer.js'
import { useGoalWeights } from '../../lib/useGoalWeights.js'
import { useIsMobile } from '../../lib/useIsMobile.js'
import {
  Btn, Row, Autocomplete, ClassBadge, DtBadge, Spinner, HR, SectionHead,
} from '../UI/index.jsx'

// ── Goal badge ─────────────────────────────────────────────
function GoalBadge({ goal }) {
  const color = GOAL_COLORS[goal] ?? t.dim
  const label = GOAL_INFO[goal]?.short ?? goal
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 3, padding: '2px 8px', fontSize: 11, fontFamily: t.mono,
      color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  )
}

// ── Step indicator ─────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Car', 'Goal', 'PI Cap', 'Result']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: i <= current ? t.accent : t.surf3,
              color: i <= current ? '#000' : t.dim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontFamily: t.mono, fontWeight: 700,
            }}>
              {i + 1}
            </div>
            <span style={{
              fontSize: 11, fontFamily: t.mono,
              color: i === current ? t.accent : i < current ? t.mid : t.dim,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span style={{ color: t.border, fontSize: 12 }}>—</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Car select from full catalog ──────────────────
function CarStep({ onSelect }) {
  const [makes,  setMakes]  = useState([])
  const [models, setModels] = useState([])
  const [cars,   setCars]   = useState([])
  const [make,   setMake]   = useState('')
  const [model,  setModel]  = useState('')
  const [year,   setYear]   = useState('')

  useEffect(() => {
    supabase.from('cars').select('make').eq('verified', true)
      .then(({ data }) => setMakes([...new Set((data || []).map(r => r.make))].sort()))
  }, [])

  useEffect(() => {
    if (!make) { setModels([]); setModel(''); return }
    supabase.from('cars').select('model').eq('make', make).eq('verified', true)
      .then(({ data }) => setModels([...new Set((data || []).map(r => r.model))].sort()))
  }, [make])

  useEffect(() => {
    if (!make || !model) { setCars([]); setYear(''); return }
    supabase.from('cars').select('*')
      .eq('make', make).eq('model', model).eq('verified', true).order('year')
      .then(({ data }) => setCars(data || []))
  }, [make, model])

  const matched = year ? cars.find(c => String(c.year) === String(year)) : null

  return (
    <div>
      <SectionHead>Select a Car</SectionHead>
      <Row label="Make">
        <Autocomplete value={make} onChange={v => { setMake(v); setModel(''); setYear('') }}
          onSelect={v => { setMake(v); setModel(''); setYear('') }}
          suggestions={makes} placeholder="e.g. Toyota" />
      </Row>
      <Row label="Model">
        <Autocomplete value={model} onChange={v => { setModel(v); setYear('') }}
          onSelect={v => { setModel(v); setYear('') }}
          suggestions={models} placeholder="e.g. Supra" />
      </Row>
      {cars.length > 0 && (
        <Row label="Year">
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: year ? t.text : t.dim,
              padding: '7px 10px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
              width: '100%', outline: 'none',
            }}>
            <option value="">Select year</option>
            {cars.map(c => <option key={c.id} value={c.year}>{c.year}</option>)}
          </select>
        </Row>
      )}
      {matched && (
        <div style={{
          background: t.surf2, border: `1px solid ${t.green}33`, borderRadius: 6,
          padding: '12px 14px', marginTop: 8, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.head, fontSize: 18, fontWeight: 700, color: t.text, textTransform: 'uppercase' }}>
              {matched.make} {matched.model}
            </span>
            {matched.stock_class && <ClassBadge cls={matched.stock_class} pi={matched.stock_pi} />}
            {matched.stock_drivetrain && <DtBadge dt={matched.stock_drivetrain} />}
          </div>
          <Btn onClick={() => onSelect(matched)}>Continue →</Btn>
        </div>
      )}
    </div>
  )
}

// ── Step 2: Goal select ───────────────────────────────────
function GoalStep({ onSelect, car }) {
  const [hover, setHover] = useState(null)
  return (
    <div>
      <SectionHead>Build Goal</SectionHead>
      <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono, marginBottom: 16 }}>
        {car.make} {car.model} — what are you building for?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {GOALS.map(g => {
          const info = GOAL_INFO[g]
          const color = GOAL_COLORS[g]
          return (
            <div key={g}
              onClick={() => onSelect(g)}
              onMouseEnter={() => setHover(g)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: t.surf, border: `1px solid ${hover === g ? color : t.border}`,
                borderRadius: 6, padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s',
              }}>
              <div style={{
                fontFamily: t.head, fontSize: 18, fontWeight: 700, color,
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4,
              }}>
                {info.label}
              </div>
              <div style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, lineHeight: 1.4 }}>
                {info.desc}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3: PI cap ─────────────────────────────────────────
function PiStep({ onSubmit, car, goal }) {
  const [pi, setPi] = useState('')
  const derivedClass = classFromPi(pi)
  const valid = pi && (derivedClass || parseInt(pi) >= 999)

  return (
    <div>
      <SectionHead>PI Target</SectionHead>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: t.head, fontSize: 16, color: t.text, textTransform: 'uppercase' }}>
          {car.make} {car.model}
        </span>
        <GoalBadge goal={goal} />
      </div>
      <Row label="Target PI cap">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="number" value={pi} onChange={e => setPi(e.target.value)}
            placeholder="e.g. 800" min={100} max={999} autoFocus
            onKeyDown={e => e.key === 'Enter' && valid && onSubmit(parseInt(pi))}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
              padding: '8px 12px', borderRadius: 4, fontSize: 16, fontFamily: t.mono,
              width: 140, outline: 'none',
            }} />
          {derivedClass && <ClassBadge cls={derivedClass} />}
          {pi && parseInt(pi) >= 999 && !derivedClass && <ClassBadge cls="X" />}
        </div>
        <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, marginTop: 6 }}>
          The optimizer will not exceed this PI. X class (999+) has no upper limit.
        </div>
      </Row>
      <HR />
      <Btn onClick={() => onSubmit(parseInt(pi))} disabled={!valid} full>
        ⚡ Optimize Build
      </Btn>
    </div>
  )
}

// ── Step 4: Result ─────────────────────────────────────────
const STAT_LABELS = {
  power_hp: 'Power', torque_nm: 'Torque', weight_kg: 'Weight',
  top_speed_kmh: 'Top Speed', stat_speed: 'Speed', stat_handling: 'Handling',
  stat_acceleration: 'Acceleration', stat_launch: 'Launch',
  stat_braking: 'Braking', stat_offroad: 'Off-Road',
}

function ResultStep({ car, goal, piCap, result, onSave, saving, savedMsg, onRestart }) {
  const isX = piCap >= 999
  const over = !isX && result.totalPi > piCap
  const displayCls = isX ? 'X' : classFromPi(result.totalPi)

  // Aggregate stat totals from selected parts + base
  const statTotals = useMemo(() => {
    const base = car.base_stats || {}
    const totals = {}
    Object.keys(STAT_LABELS).forEach(k => {
      const delta = result.selected.reduce((acc, p) => {
        const v = p.effects?.[k]
        return typeof v === 'number' ? acc + v : acc
      }, 0)
      const baseV = typeof base[k] === 'number' ? base[k] : 0
      totals[k] = { base: baseV, delta, final: Math.round((baseV + delta) * 100) / 100 }
    })
    return totals
  }, [car, result])

  if (result.empty) {
    return (
      <div>
        <SectionHead>No Parts Available</SectionHead>
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 32, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
        }}>
          This car has no parts in the catalog yet — nothing to optimize.
        </div>
        <div style={{ marginTop: 16 }}>
          <Btn variant="ghost" onClick={onRestart}>← Start Over</Btn>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: t.head, fontSize: 22, fontWeight: 800, color: t.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {car.make} {car.model}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <GoalBadge goal={goal} />
            {displayCls && <ClassBadge cls={displayCls} pi={result.totalPi} />}
            <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim }}>
              target {isX ? 'X (999+)' : piCap}
            </span>
          </div>
        </div>
        <Btn onClick={onSave} disabled={saving || over}>
          {saving ? '…' : savedMsg ? '✓ Saved' : 'Save as Build'}
        </Btn>
      </div>

      {over && (
        <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 12 }}>
          Result exceeds PI cap — try a higher target.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recommended parts */}
        <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontFamily: t.mono, color: t.mid, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Recommended Parts ({result.selected.length})
          </div>
          {result.breakdown.map((b, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderBottom: `1px solid ${t.border}22`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontFamily: t.mono, color: t.text }}>{b.part.name}</div>
                <div style={{ fontSize: 10, fontFamily: t.mono, color: t.dim }}>{b.subcat}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontFamily: t.mono, color: b.pi > 0 ? t.red : b.pi < 0 ? t.green : t.dim, fontWeight: 700 }}>
                  PI {b.pi > 0 ? `+${b.pi}` : b.pi}
                </div>
                <div style={{ fontSize: 10, fontFamily: t.mono, color: t.accent }}>
                  {b.score.toFixed(0)} pts
                </div>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10,
            borderTop: `1px solid ${t.border}`,
          }}>
            <span style={{ fontSize: 13, fontFamily: t.mono, fontWeight: 700, color: over ? t.red : t.text }}>
              Total PI: {result.totalPi}{isX ? '' : ` / ${piCap}`}
            </span>
          </div>
        </div>

        {/* Stat projection */}
        <div style={{ background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, fontFamily: t.mono, color: t.mid, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Projected Stats
          </div>
          {Object.entries(STAT_LABELS).map(([k, label]) => {
            const s = statTotals[k]
            if (!s || (s.base === 0 && s.delta === 0)) return null
            const lowerBetter = k === 'weight_kg'
            const good = (s.delta > 0) === !lowerBetter
            return (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `1px solid ${t.border}22` }}>
                <span style={{ fontSize: 12, fontFamily: t.mono, color: t.dim }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.delta !== 0 && (
                    <span style={{ fontSize: 11, fontFamily: t.mono, color: t.mid }}>{s.base}</span>
                  )}
                  {s.delta !== 0 && <span style={{ fontSize: 10, color: t.dim }}>→</span>}
                  <span style={{ fontSize: 12, fontFamily: t.mono, color: t.text, fontWeight: 700 }}>{s.final}</span>
                  {s.delta !== 0 && (
                    <span style={{ fontSize: 10, fontFamily: t.mono, color: good ? t.green : t.red }}>
                      {s.delta > 0 ? '+' : ''}{Math.round(s.delta * 100) / 100}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Btn variant="ghost" onClick={onRestart}>← Start Over</Btn>
      </div>
    </div>
  )
}

// ── Main Advisor ───────────────────────────────────────────
export default function Advisor({ userId }) {
  const [step,    setStep]    = useState(0)
  const [car,     setCar]     = useState(null)
  const [goal,    setGoal]    = useState(null)
  const [piCap,   setPiCap]   = useState(null)
  const [parts,   setParts]   = useState([])
  const [result,  setResult]  = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [savedMsg,setSavedMsg]= useState(false)
  const { loading: weightsLoading, weights } = useGoalWeights()

  const runOptimize = async (cap) => {
    setPiCap(cap)
    // Load parts for this car
    const { data } = await supabase.from('car_parts').select('*').eq('car_id', car.id)
    const carParts = data || []
    setParts(carParts)
    const goalWeights = weights[goal] || { stats: {}, unlocks: {} }
    const isX = cap >= 999
    const r = optimize(carParts, goalWeights, cap, isX)
    setResult(r)
    setStep(3)
  }

  const saveAsBuild = async () => {
    setSaving(true)
    // Ensure car is in user's garage
    let { data: existing } = await supabase.from('user_cars')
      .select('id').eq('user_id', userId).eq('car_id', car.id).maybeSingle()

    let userCarId = existing?.id
    if (!userCarId) {
      const { data: newUC } = await supabase.from('user_cars')
        .insert({ user_id: userId, car_id: car.id }).select('id').single()
      userCarId = newUC.id
    }

    // Create build
    const isX = piCap >= 999
    await supabase.from('builds').insert({
      user_car_id: userCarId,
      name: `${GOAL_INFO[goal].short} ${isX ? 'X' : classFromPi(piCap) || piCap}`,
      goal,
      target_class: isX ? 'X' : classFromPi(piCap),
      target_pi: piCap,
      current_pi: result.totalPi,
      installed_parts: result.selected.map(p => p.id),
    })

    setSaving(false); setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const restart = () => {
    setStep(0); setCar(null); setGoal(null); setPiCap(null)
    setParts([]); setResult(null); setSavedMsg(false)
  }

  if (weightsLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
  )

  return (
    <div style={{ padding: '20px 24px', maxWidth: 860, margin: '0 auto' }}>
      <Steps current={step} />
      {step === 0 && <CarStep onSelect={c => { setCar(c); setStep(1) }} />}
      {step === 1 && car && <GoalStep car={car} onSelect={g => { setGoal(g); setStep(2) }} />}
      {step === 2 && car && goal && <PiStep car={car} goal={goal} onSubmit={runOptimize} />}
      {step === 3 && result && (
        <ResultStep
          car={car} goal={goal} piCap={piCap} result={result}
          onSave={saveAsBuild} saving={saving} savedMsg={savedMsg}
          onRestart={restart}
        />
      )}
    </div>
  )
}

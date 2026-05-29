import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import { useBuilder } from '../hooks/useBuilder'
import { useTuning } from '../hooks/useTuning'
import { GOALS, GOAL_COLORS } from '../constants/goals'
import { Button, Card, Badge } from '../components/ui'

const PI_CLASSES = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']

// ── Tuning Calculator display ─────────────────────────────

function TuneValue({ label, value, unit = '' }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-dim text-xs uppercase tracking-wider">{label}</span>
      <span className="font-mono text-text font-semibold text-sm">
        {value != null ? `${value}${unit}` : '—'}
      </span>
    </div>
  )
}

function TuneSection({ title, children }) {
  return (
    <div>
      <p className="text-dim text-xs uppercase tracking-widest mb-2">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surf2 rounded-lg p-3">
        {children}
      </div>
    </div>
  )
}

function TuningCalculator({ tune, calculating, onRecalculate }) {
  if (calculating) {
    return (
      <div className="flex items-center justify-center py-8 text-dim text-sm">
        Calculating…
      </div>
    )
  }

  if (!tune) {
    return (
      <div className="flex items-center justify-center py-8 text-dim text-sm">
        No tuning data yet.
      </div>
    )
  }

  const { springs, dampers, arb, alignment, finalDrive } = tune

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-dim text-xs">Calculated from car data · not editable</p>
        <Button size="sm" variant="secondary" onClick={onRecalculate}>
          <RefreshCw size={13} /> Recalculate
        </Button>
      </div>

      <TuneSection title="Springs (kgf/mm)">
        <TuneValue label="Front"         value={springs.front} />
        <TuneValue label="Rear"          value={springs.rear} />
      </TuneSection>

      <TuneSection title="Dampers">
        <TuneValue label="Front Bump"    value={dampers.front.bump} />
        <TuneValue label="Front Rebound" value={dampers.front.rebound} />
        <TuneValue label="Rear Bump"     value={dampers.rear.bump} />
        <TuneValue label="Rear Rebound"  value={dampers.rear.rebound} />
      </TuneSection>

      <TuneSection title="Anti-Roll Bars">
        <TuneValue label="Front ARB"     value={arb.front} />
        <TuneValue label="Rear ARB"      value={arb.rear} />
      </TuneSection>

      <TuneSection title="Alignment">
        <TuneValue label="Front Camber"  value={alignment.camber.front} unit="°" />
        <TuneValue label="Rear Camber"   value={alignment.camber.rear}  unit="°" />
        <TuneValue label="Front Toe"     value={alignment.toe.front}    unit="°" />
        <TuneValue label="Rear Toe"      value={alignment.toe.rear}     unit="°" />
        <TuneValue label="Caster"        value={alignment.caster}       unit="°" />
      </TuneSection>

      <TuneSection title="Gearing">
        <TuneValue label="Final Drive"   value={finalDrive} />
      </TuneSection>
    </div>
  )
}

// ── Builder page ──────────────────────────────────────────

export default function Builder() {
  const { id: buildId } = useParams()
  const navigate = useNavigate()
  const { build, loading, saving, updateField } = useBuilder(buildId)
  const { tune, calculating, recalculate } = useTuning(build?.user_car?.car, build?.goal)

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [targetClass, setTargetClass] = useState('')
  const [targetPi, setTargetPi] = useState('')
  const [notesDirty, setNotesDirty] = useState(false)
  const [targetDirty, setTargetDirty] = useState(false)

  useEffect(() => {
    if (build) {
      setName(build.name ?? '')
      setNotes(build.notes ?? '')
      setTargetClass(build.target_class ?? '')
      setTargetPi(build.target_pi != null ? String(build.target_pi) : '')
    }
  }, [build])

  if (loading) {
    return <div className="text-center text-dim py-24 text-base">Loading…</div>
  }

  if (!build) {
    return (
      <div className="text-center py-24">
        <p className="text-dim text-base mb-4">Build not found.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Back to Garage</Button>
      </div>
    )
  }

  const car = build.user_car?.car
  const goalMeta = GOALS.find(g => g.key === build.goal)
  const goalColor = GOAL_COLORS[build.goal] ?? 'mid'

  const handleNameBlur = async () => {
    const trimmed = name.trim() || null
    if (trimmed !== (build.name ?? null)) {
      await updateField({ name: trimmed })
    }
  }

  const handleSaveNotes = async () => {
    await updateField({ notes: notes.trim() || null })
    setNotesDirty(false)
  }

  const handleSaveTarget = async () => {
    await updateField({
      target_class: targetClass || null,
      target_pi: targetPi ? parseInt(targetPi, 10) : null,
    })
    setTargetDirty(false)
  }

  return (
    <div>
      {car ? (
        <Link
          to={`/car/${car.id}`}
          className="flex items-center gap-1.5 text-dim hover:text-text text-sm mb-6 transition-colors w-fit"
        >
          <ArrowLeft size={16} /> {car.make} {car.model}
        </Link>
      ) : (
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-dim hover:text-text text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Garage
        </button>
      )}

      <div className="flex items-start gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge color={goalColor}>{goalMeta?.label ?? build.goal}</Badge>
            {car && (
              <span className="text-dim text-sm">
                {car.make} {car.model} · {car.year} · {car.stock_class}
              </span>
            )}
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Build name…"
            className="font-barlow text-3xl font-bold text-text bg-transparent focus:outline-none border-b border-transparent focus:border-border w-full max-w-lg pb-0.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-barlow text-lg font-bold text-text mb-4">Target</h2>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-dim text-xs mb-1.5 block">Class</label>
              <select
                value={targetClass}
                onChange={e => { setTargetClass(e.target.value); setTargetDirty(true) }}
                className="w-full bg-surf2 border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-accent"
              >
                <option value="">— Any —</option>
                {PI_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-dim text-xs mb-1.5 block">PI</label>
              <input
                type="number"
                min={100}
                max={999}
                value={targetPi}
                onChange={e => { setTargetPi(e.target.value); setTargetDirty(true) }}
                placeholder="e.g. 800"
                className="w-full bg-surf2 border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-accent font-mono"
              />
            </div>
          </div>
          {targetDirty && (
            <Button size="sm" onClick={handleSaveTarget} disabled={saving}>
              <Save size={14} /> Save Target
            </Button>
          )}
          {!targetDirty && (build.target_class || build.target_pi) && (
            <p className="text-dim text-xs">
              Current: {build.target_class ?? '—'} · {build.target_pi ?? '—'} PI
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-barlow text-lg font-bold text-text mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesDirty(true) }}
            placeholder="Setup notes, observations, changes to test…"
            rows={5}
            className="w-full bg-surf2 border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:border-accent resize-none"
          />
          {notesDirty && (
            <Button size="sm" className="mt-2" onClick={handleSaveNotes} disabled={saving}>
              <Save size={14} /> Save Notes
            </Button>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-barlow text-lg font-bold text-text mb-4">Tuning Calculator</h2>
          <TuningCalculator
            tune={tune}
            calculating={calculating}
            onRecalculate={recalculate}
          />
        </Card>
      </div>
    </div>
  )
}

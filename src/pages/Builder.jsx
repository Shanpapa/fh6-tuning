import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useBuilder } from '../hooks/useBuilder'
import { GOALS, GOAL_COLORS } from '../constants/goals'
import { Button, Card, Badge } from '../components/ui'

const PI_CLASSES = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']

export default function Builder() {
  const { id: buildId } = useParams()
  const navigate = useNavigate()
  const { build, loading, saving, updateField } = useBuilder(buildId)

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

        <Card className="p-5 lg:col-span-2 border-dashed">
          <h2 className="font-barlow text-lg font-bold text-mid mb-1">Tuning Calculator</h2>
          <p className="text-dim text-sm">
            Coming in Session D — spring rates, dampers, alignment, ARB, final drive.
          </p>
        </Card>
      </div>
    </div>
  )
}

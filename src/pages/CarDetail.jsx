import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Pencil, Check, X } from 'lucide-react'
import { useCarDetail } from '../hooks/useCarDetail'
import { GOALS, GOAL_COLORS } from '../constants/goals'
import { Button, Card, Badge } from '../components/ui'

const STAT_LABELS = {
  stat_speed:        'Speed',
  stat_handling:     'Handling',
  stat_acceleration: 'Accel',
  stat_launch:       'Launch',
  stat_braking:      'Braking',
  stat_offroad:      'Off-Road',
}

const STAT_COLORS = {
  stat_speed:        'bg-accent',
  stat_handling:     'bg-blue',
  stat_acceleration: 'bg-green',
  stat_launch:       'bg-yellow',
  stat_braking:      'bg-red',
  stat_offroad:      'bg-mid',
}

export default function CarDetail() {
  const { id: carId } = useParams()
  const navigate = useNavigate()
  const { car, builds, loading, error, updateBuildName } = useCarDetail(carId)

  if (loading) {
    return <div className="text-center text-dim py-24 text-base">Loading…</div>
  }

  if (error || !car) {
    return (
      <div className="text-center py-24">
        <p className="text-dim text-base mb-4">Car not found.</p>
        <Button variant="secondary" onClick={() => navigate('/')}>Back to Garage</Button>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-dim hover:text-text text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Garage
      </button>

      <div className="mb-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-barlow text-4xl font-bold text-text">
            {car.make} {car.model}
          </h1>
          <span className="font-barlow text-2xl text-dim">{car.year}</span>
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <Badge color="accent">{car.stock_class}</Badge>
          <span className="text-mid text-sm">{car.stock_pi} PI</span>
          {car.stock_drivetrain && (
            <span className="text-dim text-sm">{car.stock_drivetrain}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {car.base_stats && (
          <Card className="p-5 lg:col-span-1 h-fit">
            <h2 className="font-barlow text-lg font-bold text-text mb-4">Stock Stats</h2>
            <div className="space-y-3">
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const val = car.base_stats[key] ?? 0
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-dim text-xs">{label}</span>
                      <span className="text-mid text-xs font-mono">{val}</span>
                    </div>
                    <div className="h-1.5 bg-surf3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STAT_COLORS[key]}`}
                        style={{ width: `${Math.min(val * 10, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <div className={car.base_stats ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-barlow text-lg font-bold text-text">
              Builds
              {builds.length > 0 && (
                <span className="ml-2 text-dim text-base font-normal">({builds.length})</span>
              )}
            </h2>
          </div>

          {builds.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-dim text-sm">No builds for this car yet.</p>
              <p className="text-dim text-xs mt-1">Add a build from the Garage.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {builds.map(build => (
                <BuildRow key={build.id} build={build} onRename={updateBuildName} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BuildRow({ build, onRename }) {
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(build.name ?? '')
  const [saving, setSaving] = useState(false)
  const goalMeta = GOALS.find(g => g.key === build.goal)
  const goalColor = GOAL_COLORS[build.goal] ?? 'mid'
  const dateStr = new Date(build.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const handleSave = async () => {
    setSaving(true)
    await onRename(build.id, nameVal.trim())
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setNameVal(build.name ?? '')
    setEditing(false)
  }

  return (
    <Card className="p-4 flex items-center gap-3">
      <Badge color={goalColor} className="flex-shrink-0">
        {goalMeta?.label ?? build.goal}
      </Badge>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              className="bg-surf2 border border-border rounded-lg px-2 py-0.5 text-sm text-text focus:outline-none focus:border-accent w-full max-w-xs"
              placeholder="Build name…"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-accent hover:text-accent/80 disabled:opacity-50"
            >
              <Check size={15} />
            </button>
            <button onClick={handleCancel} className="text-dim hover:text-text">
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <span className="text-text text-sm font-semibold truncate">
              {build.name || <span className="text-dim font-normal italic">Unnamed build</span>}
            </span>
            <button
              onClick={() => { setNameVal(build.name ?? ''); setEditing(true) }}
              className="opacity-0 group-hover:opacity-100 text-dim hover:text-text transition-opacity"
              title="Rename"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
        <p className="text-dim text-xs mt-0.5">{dateStr}</p>
      </div>

      <Link
        to={`/builder/${build.id}`}
        className="flex items-center gap-1 text-accent text-xs font-semibold hover:underline flex-shrink-0"
      >
        Open Builder <ChevronRight size={13} />
      </Link>
    </Card>
  )
}

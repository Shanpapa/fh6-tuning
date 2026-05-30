import { useState } from 'react'
import { Plus, Car, Trash2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGarage } from '../hooks/useGarage'
import { Button, Card, Badge, ClassBadge, DrivetrainBadge } from '../components/ui/index.js'
import { GOALS, GOAL_COLORS } from '../constants/goals'
import AddCarModal from '../components/garage/AddCarModal'

export default function Garage() {
  const { builds, loading, addBuild, deleteBuild } = useGarage()
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = async (carId, goal, name) => {
    await addBuild({ carId, goal, name })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-barlow text-4xl font-bold text-text">My Garage</h1>
          <p className="text-dim text-base mt-1">
            {builds.length > 0
              ? `${builds.length} build${builds.length !== 1 ? 's' : ''}`
              : 'No builds yet'}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={18} />
          Add Car
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-dim py-24 text-base">Loading…</div>
      ) : builds.length === 0 ? (
        <EmptyGarage onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map(build => (
            <BuildCard key={build.id} build={build} onDelete={deleteBuild} />
          ))}
        </div>
      )}

      <AddCarModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}

function EmptyGarage({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-surf2 border border-border rounded-2xl flex items-center justify-center mb-6">
        <Car size={36} className="text-dim" />
      </div>
      <h2 className="font-barlow text-2xl font-bold text-mid mb-2">Garage is empty</h2>
      <p className="text-dim text-base mb-8 max-w-xs">
        Add your first car and build to start calculating tune values.
      </p>
      <Button onClick={onAdd} size="lg">
        <Plus size={20} />
        Add First Car
      </Button>
    </div>
  )
}

function BuildCard({ build, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const car = build.user_car?.car
  const goalMeta = GOALS.find(g => g.key === build.goal)
  const goalColor = GOAL_COLORS[build.goal] ?? 'mid'

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(build.id)
  }

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-barlow text-xl font-bold text-text leading-tight truncate">
            {car?.make} {car?.model}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-dim text-sm">{car?.year}</span>
            <span className="text-border text-sm">·</span>
            <ClassBadge cls={car?.stock_class} />
            <span className="text-dim text-sm">{car?.stock_pi}</span>
            {car?.stock_drivetrain && (
              <>
                <span className="text-border text-sm">·</span>
                <DrivetrainBadge drivetrain={car?.stock_drivetrain} />
              </>
            )}
          </div>
        </div>
        <Badge color={goalColor} className="flex-shrink-0 mt-0.5">
          {goalMeta?.label ?? build.goal}
        </Badge>
      </div>

      {build.name && (
        <p className="text-mid text-sm font-semibold">{build.name}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        {confirming ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-dim text-xs flex-1">Delete this build?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red text-xs font-semibold hover:underline disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-dim text-xs hover:text-text"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setConfirming(true)}
              className="text-dim hover:text-red transition-colors p-1 rounded-lg hover:bg-red/10"
              title="Delete build"
            >
              <Trash2 size={15} />
            </button>
            <Link
              to={`/car/${car?.id}`}
              className="flex items-center gap-1 text-accent text-xs font-semibold hover:underline"
            >
              Open build <ChevronRight size={13} />
            </Link>
          </>
        )}
      </div>
    </Card>
  )
}

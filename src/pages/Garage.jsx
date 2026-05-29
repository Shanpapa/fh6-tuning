import { useState } from 'react'
import { Plus, Car } from 'lucide-react'
import { useGarage } from '../hooks/useGarage'
import { Button, Card, Modal } from '../components/ui/index.js'

export default function Garage() {
  const { builds, loading } = useGarage()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-barlow text-4xl font-bold text-text">My Garage</h1>
          <p className="text-dim text-base mt-1">
            {builds.length > 0 ? `${builds.length} build${builds.length !== 1 ? 's' : ''}` : 'No builds yet'}
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
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Car to Garage">
        <p className="text-mid text-base">
          Car search and build creation coming in Session B.
        </p>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => setShowAdd(false)}>
          Close
        </Button>
      </Modal>
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

function BuildCard({ build }) {
  return (
    <Card className="p-4 hover:border-borderHi transition-colors cursor-pointer">
      <p className="font-barlow text-xl font-bold text-text">
        {build.car?.make} {build.car?.model}
      </p>
      <p className="text-dim text-sm">{build.car?.year}</p>
    </Card>
  )
}

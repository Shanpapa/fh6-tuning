import { useState, useEffect } from 'react'
import { Search, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { GOALS, GOAL_COLORS } from '../../constants/goals'
import { Modal, Button, ClassBadge, DrivetrainBadge } from '../ui/index.js'

export default function AddCarModal({ open, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [cars, setCars] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [buildName, setBuildName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setCars([])
      setSelectedCar(null)
      setSelectedGoal(null)
      setBuildName('')
    }
  }, [open])

  useEffect(() => {
    if (query.length < 2) { setCars([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('cars')
        .select('id, make, model, year, stock_class, stock_pi, stock_drivetrain')
        .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
        .order('make')
        .limit(20)
      setCars(data ?? [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSubmit = async () => {
    if (!selectedCar || !selectedGoal) return
    setSubmitting(true)
    await onAdd(selectedCar.id, selectedGoal, buildName.trim() || null)
    setSubmitting(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Car to Garage" maxWidth="max-w-lg">
      {/* Car search */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-mid mb-1.5">Search Car</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. Nissan Silvia, Ford Mustang…"
            className="w-full bg-surf2 border border-border rounded-lg pl-9 pr-3 py-2 text-text text-sm placeholder:text-dim focus:outline-none focus:border-accent"
          />
        </div>

        {(cars.length > 0 || (searching && query.length >= 2)) && (
          <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {searching && (
              <div className="px-3 py-2 text-dim text-sm">Searching…</div>
            )}
            {cars.map(car => (
              <button
                key={car.id}
                onClick={() => setSelectedCar(car)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors border-b border-border last:border-0 ${
                  selectedCar?.id === car.id ? 'bg-accent/10' : 'hover:bg-surf2'
                }`}
              >
                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-text text-sm font-semibold">
                    {car.year} {car.make} {car.model}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClassBadge cls={car.stock_class} />
                    <span className="text-dim text-xs">{car.stock_pi}</span>
                    <span className="text-border text-xs">·</span>
                    <DrivetrainBadge drivetrain={car.stock_drivetrain} />
                  </span>
                </div>
                {selectedCar?.id === car.id && (
                  <Check size={14} className="text-accent flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && !searching && cars.length === 0 && (
          <p className="mt-2 text-dim text-sm">No cars found for "{query}".</p>
        )}
      </div>

      {/* Selected car chip */}
      {selectedCar && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-text text-sm font-semibold">
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ClassBadge cls={selectedCar.stock_class} />
              <span className="text-dim text-xs">{selectedCar.stock_pi}</span>
              {selectedCar.stock_drivetrain && (
                <>
                  <span className="text-border text-xs">·</span>
                  <DrivetrainBadge drivetrain={selectedCar.stock_drivetrain} />
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => { setSelectedCar(null); setCars([]) }}
            className="text-dim hover:text-text text-xs ml-4 flex-shrink-0"
          >
            Change
          </button>
        </div>
      )}

      {/* Goal grid */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-mid mb-1.5">Tuning Goal</label>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map(goal => (
            <button
              key={goal.key}
              onClick={() => setSelectedGoal(goal.key)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                selectedGoal === goal.key
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surf2 hover:border-borderHi'
              }`}
            >
              <p className="text-text text-sm font-semibold leading-tight">{goal.label}</p>
              <p className="text-dim text-xs mt-0.5 leading-tight">{goal.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Build name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-mid mb-1.5">
          Build Name <span className="text-dim font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={buildName}
          onChange={e => setBuildName(e.target.value)}
          placeholder="e.g. Street Drift Setup"
          maxLength={50}
          className="w-full bg-surf2 border border-border rounded-lg px-3 py-2 text-text text-sm placeholder:text-dim focus:outline-none focus:border-accent"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!selectedCar || !selectedGoal || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Creating…' : 'Create Build'}
        </Button>
      </div>
    </Modal>
  )
}

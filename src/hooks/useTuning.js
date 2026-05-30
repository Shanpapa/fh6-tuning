import { useState, useEffect, useCallback } from 'react'
import { calculateTune } from '../lib/tuning'

export function useTuning(car, goal) {
  const [tune, setTune] = useState(null)
  const [calculating, setCalculating] = useState(false)

  const recalculate = useCallback(() => {
    if (!car || !goal) return
    setCalculating(true)
    const compound = car?.tyre_compound_stock || 'Standard'
    const result = calculateTune(car, compound, goal)
    setTune(result)
    setCalculating(false)
  }, [car, goal])

  useEffect(() => { recalculate() }, [recalculate])

  return { tune, calculating, recalculate }
}

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const CAR_FIELDS = 'id, make, model, year, stock_class, stock_pi, stock_drivetrain, front_weight_pct, suspension_type, max_rpm, base_stats'

export function useBuilder(buildId) {
  const { user } = useAuth()
  const [build, setBuild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchBuild = useCallback(async () => {
    if (!user || !buildId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('builds')
      .select(`id, name, goal, target_class, target_pi, notes, created_at, updated_at,
               user_car:user_cars(id, car:cars(${CAR_FIELDS}))`)
      .eq('id', buildId)
      .single()
    if (!error) setBuild(data)
    setLoading(false)
  }, [user, buildId])

  useEffect(() => { fetchBuild() }, [fetchBuild])

  const updateField = async (fields) => {
    setSaving(true)
    const { error } = await supabase
      .from('builds')
      .update(fields)
      .eq('id', buildId)
    if (!error) setBuild(prev => ({ ...prev, ...fields }))
    setSaving(false)
    return { error }
  }

  return { build, loading, saving, updateField, refresh: fetchBuild }
}

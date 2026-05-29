import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCarDetail(carId) {
  const { user } = useAuth()
  const [car, setCar] = useState(null)
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user || !carId) return
    setLoading(true)
    setError(null)

    const [carRes, userCarsRes] = await Promise.all([
      supabase
        .from('cars')
        .select('id, make, model, year, stock_class, stock_pi, stock_drivetrain, base_stats')
        .eq('id', carId)
        .single(),
      supabase
        .from('user_cars')
        .select('id')
        .eq('car_id', carId)
        .eq('user_id', user.id),
    ])

    if (carRes.error) { setError(carRes.error); setLoading(false); return }
    setCar(carRes.data)

    const userCarIds = (userCarsRes.data ?? []).map(uc => uc.id)
    if (userCarIds.length === 0) { setBuilds([]); setLoading(false); return }

    const { data: buildsData } = await supabase
      .from('builds')
      .select('id, name, goal, target_class, target_pi, notes, created_at')
      .in('user_car_id', userCarIds)
      .order('created_at', { ascending: false })

    setBuilds(buildsData ?? [])
    setLoading(false)
  }, [user, carId])

  useEffect(() => { fetchData() }, [fetchData])

  const updateBuildName = async (buildId, name) => {
    const { error: err } = await supabase
      .from('builds')
      .update({ name: name || null })
      .eq('id', buildId)
    if (!err) setBuilds(prev => prev.map(b => b.id === buildId ? { ...b, name: name || null } : b))
    return { error: err }
  }

  return { car, builds, loading, error, refresh: fetchData, updateBuildName }
}

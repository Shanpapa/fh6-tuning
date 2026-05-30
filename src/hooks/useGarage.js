import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useGarage() {
  const { user } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBuilds = useCallback(async () => {
    if (!user) { setBuilds([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('builds')
      .select('id, name, goal, created_at, user_car:user_cars(id, car_id, nickname, car:cars(id, make, model, year, stock_class, stock_pi))')
      .order('created_at', { ascending: false })
    setBuilds(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchBuilds() }, [fetchBuilds])

  const addBuild = async ({ carId, goal, name }) => {
    // Reuse existing user_car for this car if present
    const { data: rows } = await supabase
      .from('user_cars')
      .select('id')
      .eq('car_id', carId)
      .limit(1)

    let userCarId = rows?.[0]?.id
    if (!userCarId) {
      const { data: newUC, error } = await supabase
        .from('user_cars')
        .insert({ user_id: user.id, car_id: carId })
        .select('id')
        .single()
      if (error) return { error }
      userCarId = newUC.id
    }

    const insertPayload = { user_car_id: userCarId, goal }
    if (name) insertPayload.name = name   // omit → DB default 'Build 1' applies

    const { error } = await supabase
      .from('builds')
      .insert(insertPayload)
    if (!error) await fetchBuilds()
    return { error }
  }

  const deleteBuild = async (buildId) => {
    const { error } = await supabase.from('builds').delete().eq('id', buildId)
    if (!error) setBuilds(prev => prev.filter(b => b.id !== buildId))
    return { error }
  }

  return { builds, loading, addBuild, deleteBuild, refresh: fetchBuilds }
}

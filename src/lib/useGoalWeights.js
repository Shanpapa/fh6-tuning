import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

// Cache weights across mounts (they rarely change)
let _cache = null

// Returns { loading, weights } where weights[goal] = { stats:{}, unlocks:{} }
export function useGoalWeights() {
  const [weights, setWeights] = useState(_cache)
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache) return
    supabase.from('goal_weights').select('goal, weight_type, key, weight')
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach(row => {
          if (!map[row.goal]) map[row.goal] = { stats: {}, unlocks: {} }
          const bucket = row.weight_type === 'stat' ? 'stats' : 'unlocks'
          map[row.goal][bucket][row.key] = Number(row.weight)
        })
        _cache = map
        setWeights(map)
        setLoading(false)
      })
  }, [])

  return { loading, weights: weights || {} }
}

// For one-off non-hook access (e.g. inside optimizer called from event handler)
export async function fetchGoalWeights() {
  if (_cache) return _cache
  const { data } = await supabase.from('goal_weights').select('goal, weight_type, key, weight')
  const map = {}
  ;(data || []).forEach(row => {
    if (!map[row.goal]) map[row.goal] = { stats: {}, unlocks: {} }
    const bucket = row.weight_type === 'stat' ? 'stats' : 'unlocks'
    map[row.goal][bucket][row.key] = Number(row.weight)
  })
  _cache = map
  return map
}

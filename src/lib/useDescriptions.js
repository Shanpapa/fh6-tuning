import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

let _cache = null

export function useDescriptions() {
  const [descs, setDescs] = useState(_cache || {})

  useEffect(() => {
    if (_cache) return
    supabase.from('descriptions').select('key, title, body')
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach(d => { map[d.key] = d })
        _cache = map
        setDescs(map)
      })
  }, [])

  return descs
}

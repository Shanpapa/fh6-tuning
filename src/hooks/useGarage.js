import { useState } from 'react'

export function useGarage() {
  // Stub — full implementation in Session B (builds table + car join)
  const [builds] = useState([])
  const [loading] = useState(false)
  return { builds, loading }
}

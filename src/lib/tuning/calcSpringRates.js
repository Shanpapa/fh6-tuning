// Spring stiffness divisor per suspension type (higher = softer)
const SUSPENSION_DIVISOR = {
  'Stock':    14,
  'Street':   12,
  'Sport':    10,
  'Race':      7,
  'Drift':    11,
  'Rally':    16,
  'Off-Road': 18,
}

// Per-goal front/rear bias multipliers
const GOAL_ADJ = {
  cornering: { f: 1.05, r: 1.00 },
  balanced:  { f: 1.00, r: 1.00 },
  speed:     { f: 0.95, r: 1.05 },
  circuit:   { f: 1.10, r: 1.00 },
  touge:     { f: 1.05, r: 1.00 },
  rally:     { f: 0.90, r: 0.85 },
  offroad:   { f: 0.85, r: 0.80 },
  drift:     { f: 1.10, r: 0.65 },
  drag:      { f: 0.80, r: 1.20 },
}

// Returns { front, rear } in kgf/mm
export function calcSpringRates(weight_kg, front_pct, suspension_type, goal) {
  const w   = weight_kg  ?? 1200
  const fp  = (front_pct ?? 52) / 100
  const rp  = 1 - fp
  const div = SUSPENSION_DIVISOR[suspension_type] ?? 14
  const adj = GOAL_ADJ[goal] ?? GOAL_ADJ.balanced

  const front = Math.round(w * fp / div * adj.f * 10) / 10
  const rear  = Math.round(w * rp / div * adj.r * 10) / 10

  return { front, rear }
}

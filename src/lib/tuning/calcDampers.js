// Damper scale factors relative to spring rate — produces values on FH's 1–20 scale
const GOAL_FACTORS = {
  cornering: { fb: 0.13, fr: 0.20, rb: 0.12, rr: 0.18 },
  balanced:  { fb: 0.10, fr: 0.16, rb: 0.10, rr: 0.16 },
  speed:     { fb: 0.09, fr: 0.14, rb: 0.10, rr: 0.16 },
  circuit:   { fb: 0.12, fr: 0.18, rb: 0.11, rr: 0.17 },
  touge:     { fb: 0.11, fr: 0.17, rb: 0.11, rr: 0.17 },
  rally:     { fb: 0.08, fr: 0.12, rb: 0.07, rr: 0.11 },
  offroad:   { fb: 0.07, fr: 0.10, rb: 0.06, rr: 0.09 },
  drift:     { fb: 0.09, fr: 0.14, rb: 0.12, rr: 0.18 },
  drag:      { fb: 0.07, fr: 0.11, rb: 0.10, rr: 0.15 },
}

function clamp(v) { return Math.min(20, Math.max(1, Math.round(v * 10) / 10)) }

// front_spring / rear_spring are kgf/mm values from calcSpringRates
export function calcDampers(front_spring, rear_spring, goal) {
  const f = GOAL_FACTORS[goal] ?? GOAL_FACTORS.balanced

  return {
    front: { bump: clamp(front_spring * f.fb), rebound: clamp(front_spring * f.fr) },
    rear:  { bump: clamp(rear_spring  * f.rb), rebound: clamp(rear_spring  * f.rr) },
  }
}

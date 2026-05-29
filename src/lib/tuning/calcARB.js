// ARB range in FH is 1–65
const DRIVETRAIN_BASE = {
  RWD: { f: 33, r: 42 },
  FWD: { f: 42, r: 28 },
  AWD: { f: 38, r: 38 },
}

// Delta from base per goal
const GOAL_DELTA = {
  cornering: { f: +8,  r: -5  },
  balanced:  { f:  0,  r:  0  },
  speed:     { f: +2,  r: +3  },
  circuit:   { f: +6,  r: -8  },
  touge:     { f: +5,  r: -5  },
  rally:     { f: -5,  r: -8  },
  offroad:   { f: -10, r: -12 },
  drift:     { f: -12, r: +15 },
  drag:      { f: -8,  r: +5  },
}

function clamp(v) { return Math.min(65, Math.max(1, Math.round(v))) }

// front_pct_decimal: e.g. 0.54
export function calcARB(drivetrain, front_pct_decimal, goal) {
  const base  = DRIVETRAIN_BASE[drivetrain] ?? DRIVETRAIN_BASE.RWD
  const delta = GOAL_DELTA[goal] ?? GOAL_DELTA.balanced

  // Weight distribution adjustment: heavier front → more front ARB available
  const wtAdj = Math.round((front_pct_decimal - 0.50) * 10)

  return {
    front: clamp(base.f + delta.f + wtAdj),
    rear:  clamp(base.r + delta.r - wtAdj),
  }
}

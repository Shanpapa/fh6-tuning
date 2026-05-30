// Tyre pressure recommendation (BAR, FH6 in-game values).
// Source: FATTY goal + compound matrix.
//
// Logic: each goal has a recommended compound set and a target pressure. If the
// fitted compound matches the goal's recommendation, use the goal target;
// otherwise fall back to the fitted compound's natural pressure — we never force
// a compound swap. Drift is the only goal that splits front/rear (lower rear for
// a bigger rear contact patch / easier rotation); that split rides on the Drift
// compound, so it applies when the Drift compound is actually fitted.

// Per-goal target pressure + the compounds that satisfy this goal.
const GOAL_PRESSURE = {
  cornering: { front: 2.21, rear: 2.21, compounds: ['Semi-Slick', 'Race Slick'] },
  circuit:   { front: 2.21, rear: 2.21, compounds: ['Semi-Slick', 'Race Slick'] },
  touge:     { front: 2.21, rear: 2.21, compounds: ['Semi-Slick', 'Race Slick'] },
  balanced:  { front: 1.93, rear: 1.93, compounds: ['Sport'] },
  speed:     { front: 1.93, rear: 1.93, compounds: ['Sport'] },
  rally:     { front: 1.86, rear: 1.86, compounds: ['Rally'] },
  offroad:   { front: 1.79, rear: 1.79, compounds: ['Off-Road'] },
  drift:     { front: 2.21, rear: 2.07, compounds: ['Drift'] },
  drag:      { front: 1.41, rear: 1.41, compounds: ['Drag'] },
}

// Natural base pressure per compound (used when the fitted compound doesn't
// match the goal's recommendation).
const COMPOUND_PRESSURE = {
  'Standard':   { front: 1.90, rear: 1.90 },
  'Stock':      { front: 1.90, rear: 1.90 },
  'Street':     { front: 1.90, rear: 1.90 },
  'Sport':      { front: 1.93, rear: 1.93 },
  'Semi-Slick': { front: 2.07, rear: 2.07 },
  'Race Slick': { front: 2.21, rear: 2.21 },
  'Drift':      { front: 2.21, rear: 2.07 },
  'Rally':      { front: 1.86, rear: 1.86 },
  'Off-Road':   { front: 1.79, rear: 1.79 },
  'Drag':       { front: 1.41, rear: 1.41 },
}

const DEFAULT_PRESSURE = { front: 1.90, rear: 1.90 }

export function calcTirePressure(compound, goal) {
  const g = GOAL_PRESSURE[goal]

  // Fitted compound matches the goal's recommendation -> use the goal target.
  if (g && g.compounds.includes(compound)) {
    return { front: g.front, rear: g.rear }
  }

  // Otherwise use the fitted compound's natural pressure (no forced swap).
  const c = COMPOUND_PRESSURE[compound] ?? DEFAULT_PRESSURE
  return { front: c.front, rear: c.rear }
}

// Anti-roll bar stiffness (front/rear, FH6 1–65 scale).
// Source: FATTY reference values (Nissan Silvia K's '89, RWD), goal-calibrated.
//
// Physics: stiffer FRONT ARB -> more understeer (front resists roll more than
// rear); stiffer REAR ARB -> more oversteer. Rally/off-road keep both near the
// minimum so the wheels follow uneven terrain. Drift wants a soft front + very
// stiff rear (nose tucks in, rear holds the angle). Drag runs a soft front
// (weight shifts rearward) and stiffer rear. RWD circuit/cornering keep the
// rear only moderate — too stiff with a strong engine invites snap oversteer.
//
// The per-goal base values are calibrated for the RWD reference at ~54% front
// weight; the weight-distribution and drivetrain deltas adjust from there and
// vanish at the reference (so the reference car reproduces FATTY exactly).

const ARB_RANGE = { min: 1, max: 65 }

// Reference front weight % the base table is calibrated at.
const REF_FRONT_PCT = 54

// Per-goal baseline { f: front, r: rear } at the FATTY reference.
const GOAL_ARB = {
  drift:     { f: 10, r: 50 },
  rally:     { f:  5, r:  8 },
  offroad:   { f:  5, r:  8 },
  circuit:   { f: 22, r: 30 },
  cornering: { f: 22, r: 28 },
  touge:     { f: 22, r: 30 },
  drag:      { f: 15, r: 35 },
  balanced:  { f: 20, r: 28 },
  speed:     { f: 18, r: 30 },
}

// Drivetrain deltas relative to the RWD reference. FWD rotates the car with a
// stiffer rear / softer front (fights power understeer); AWD adds a touch of
// front to counter its natural understeer.
const DRIVETRAIN_ADJ = {
  RWD: { f:  0, r:  0 },
  FWD: { f: -3, r:  5 },
  AWD: { f:  3, r: -2 },
}

export function calcARB(car, goal) {
  const base      = GOAL_ARB[goal] ?? GOAL_ARB.balanced
  const front_pct = parseFloat(car?.front_weight_pct ?? REF_FRONT_PCT)
  const dt        = DRIVETRAIN_ADJ[car?.stock_drivetrain] ?? DRIVETRAIN_ADJ.RWD

  // More front weight than the reference -> stiffer front, softer rear.
  const wbDelta = (front_pct - REF_FRONT_PCT) * 0.5

  const clamp = (v) =>
    Math.round(Math.max(ARB_RANGE.min, Math.min(ARB_RANGE.max, v)))

  return {
    front: clamp(base.f + wbDelta + dt.f),
    rear:  clamp(base.r - wbDelta + dt.r),
  }
}

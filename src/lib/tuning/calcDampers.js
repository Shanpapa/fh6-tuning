// Damper rates (bump & rebound, FH6 1.0–20.0 slider, 2-decimal precision).
// Source: FATTY reference (Silvia K's, Race suspension, road racing) + FH6 rules.
//
// Damping scales with spring rate: a heavier car runs stiffer springs (see
// calcSpringRates) and therefore needs stiffer dampers. The per-goal base bump
// values below are calibrated to FATTY at the reference Silvia spring rates
// (front 618 / rear 530 N/mm); other cars scale by their spring-rate ratio.
//
// REBOUND DECISION: rebound = bump x 1.74 (FATTY-calibrated), NOT the x1.5 rule
// of thumb. FATTY's validated rebound (5.8 -> 10.1, 5.9 -> 10.2) is a ~1.74
// ratio; x1.5 would give 8.7 and miss it. Consistent with this project's
// principle of trusting in-game-validated values over approximations.
//
// NOTE (drag): the expected-output table specifies soft front / stiff rear
// bump (4.0 / 5.0), which is what's implemented here. The physics blurb earlier
// in the brief says the opposite (stiff front / soft rear), and real drag
// tuning actually favors a SOFT rear to let it squat and plant the drive tyres.
// Following the output table as the authoritative spec; flagged for review.

const DAMPER_RANGE = { min: 1.0, max: 20.0 }
const REBOUND_RATIO = 1.74

// Reference spring rates the base bump table is calibrated at (N/mm).
const REF_SPRING = { front: 618, rear: 530 }

// Per-goal base bump { f: front, r: rear } at the reference spring rates.
const GOAL_BUMP = {
  circuit:   { f: 5.8, r: 5.9 },   // FATTY reference
  cornering: { f: 5.6, r: 5.7 },   // near circuit
  touge:     { f: 5.5, r: 5.5 },
  balanced:  { f: 5.0, r: 5.0 },
  speed:     { f: 4.5, r: 5.0 },
  drift:     { f: 4.0, r: 4.0 },   // soft both ends — stiff damping kills slide rhythm
  drag:      { f: 4.0, r: 5.0 },   // soft front / stiff rear (see NOTE above)
  rally:     { f: 3.5, r: 3.0 },   // soft
  offroad:   { f: 3.0, r: 2.8 },   // softest
}

// springs = { front, rear } in N/mm from calcSpringRates.
export function calcDampers(springs, car, goal) {
  const base = GOAL_BUMP[goal] ?? GOAL_BUMP.balanced

  // Heavier/stiffer car -> proportionally stiffer dampers. Spring rates already
  // encode the car's mass and weight distribution, so `car` is accepted for
  // signature stability but the scaling reads off `springs`.
  const scaleF = (springs?.front ?? REF_SPRING.front) / REF_SPRING.front
  const scaleR = (springs?.rear  ?? REF_SPRING.rear)  / REF_SPRING.rear

  const clamp = (v) =>
    Math.round(Math.max(DAMPER_RANGE.min, Math.min(DAMPER_RANGE.max, v)) * 100) / 100

  const bumpF = clamp(base.f * scaleF)
  const bumpR = clamp(base.r * scaleR)

  return {
    bump:    { front: bumpF, rear: bumpR },
    rebound: { front: clamp(bumpF * REBOUND_RATIO), rear: clamp(bumpR * REBOUND_RATIO) },
  }
}

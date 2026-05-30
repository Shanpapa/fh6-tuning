// Wheel alignment (camber & toe in degrees, caster in degrees).
// Source: FATTY reference (Nissan Silvia K's '89) + FH6 in-game validation.
//
// CASTER DECISION — Option C (goal-dependent): drift 7.0°, everything else 6.0°.
// Rationale: CONTEXT_V3_2 pins the road-racing sweet spot at 6.0° ("above 6.0°
// causes snap on turn-in"), while drift benefits from near-max caster (~7.0°)
// for the extra steering angle and self-centring that helps catch and hold a
// slide. Options B (weight-based) and D (compound-based) aren't expressible —
// the signature calcAlignment(goal, drivetrain) carries no weight or compound.

const ROAD_CASTER  = 6.0
const DRIFT_CASTER = 7.0

// Per-goal presets. camber/toe in degrees (f = front, r = rear).
const PRESETS = {
  // Road-racing baseline (FATTY): mild negative camber, neutral front toe,
  // slight rear toe for stability.
  cornering: { camber: { f: -1.35, r: -0.95 }, toe: { f: 0.0, r: 0.1 } },
  circuit:   { camber: { f: -1.35, r: -0.95 }, toe: { f: 0.0, r: 0.1 } },
  touge:     { camber: { f: -1.35, r: -0.95 }, toe: { f: 0.0, r: 0.1 } },
  balanced:  { camber: { f: -1.35, r: -0.95 }, toe: { f: 0.0, r: 0.1 } },
  speed:     { camber: { f: -1.35, r: -0.95 }, toe: { f: 0.0, r: 0.1 } },

  // Drift: heavy front camber keeps the outside tyre planted at big angles;
  // mild rear camber; front toe-out for turn-in, rear toe-in for stability.
  drift:     { camber: { f: -3.5, r: -0.5 }, toe: { f: 0.5, r: -0.5 } },

  // Drag: straight-line — flat contact patches, zero toe (no scrub).
  drag:      { camber: { f: 0.0, r: 0.0 }, toe: { f: 0.0, r: 0.0 } },

  // Rally / off-road: milder camber than tarmac racing (less tyre deformation
  // on loose surfaces), toe near zero. Off-road softer still.
  rally:     { camber: { f: -0.8, r: -0.5 }, toe: { f: 0.0, r: 0.0 } },
  offroad:   { camber: { f: -0.6, r: -0.4 }, toe: { f: 0.0, r: 0.0 } },
}

// RWD + drift: a touch more front toe-out to aid rotation.
const DRIVETRAIN_TWEAK = {
  drift: {
    RWD: { toeFrontDelta: 0.1 },
  },
}

export function calcAlignment(goal, drivetrain) {
  const preset = PRESETS[goal] ?? PRESETS.balanced
  const tweak  = DRIVETRAIN_TWEAK[goal]?.[drivetrain]
  const caster = goal === 'drift' ? DRIFT_CASTER : ROAD_CASTER

  const frontToe = preset.toe.f + (tweak?.toeFrontDelta ?? 0)

  return {
    camber: { front: preset.camber.f, rear: preset.camber.r },
    toe:    { front: Math.round(frontToe * 100) / 100, rear: preset.toe.r },
    caster,
  }
}

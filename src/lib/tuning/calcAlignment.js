// Goal-based alignment presets (all in degrees)
const PRESETS = {
  cornering: { camber: { f: -2.5, r: -1.5 }, toe: { f:  0.1, r:  0.2 }, caster: 6.5 },
  balanced:  { camber: { f: -1.8, r: -1.0 }, toe: { f:  0.1, r:  0.1 }, caster: 5.5 },
  speed:     { camber: { f: -1.2, r: -0.8 }, toe: { f:  0.1, r:  0.1 }, caster: 5.0 },
  circuit:   { camber: { f: -3.0, r: -2.0 }, toe: { f:  0.1, r:  0.2 }, caster: 7.0 },
  touge:     { camber: { f: -2.8, r: -1.8 }, toe: { f:  0.1, r:  0.2 }, caster: 6.5 },
  rally:     { camber: { f: -1.5, r: -1.0 }, toe: { f:  0.0, r:  0.1 }, caster: 5.0 },
  offroad:   { camber: { f: -0.5, r: -0.3 }, toe: { f:  0.0, r:  0.0 }, caster: 4.0 },
  drift:     { camber: { f: -3.5, r: -0.5 }, toe: { f:  0.5, r: -0.5 }, caster: 6.5 },
  drag:      { camber: { f: -0.5, r: -0.2 }, toe: { f:  0.0, r:  0.1 }, caster: 3.0 },
}

// RWD drift gets slight adjustments to further encourage rotation
const DRIVETRAIN_TWEAK = {
  drift: {
    RWD: { camberRearDelta: 0.0, toeFrontDelta: 0.1 },
  },
}

export function calcAlignment(goal, drivetrain) {
  const preset = PRESETS[goal] ?? PRESETS.balanced
  const tweak  = DRIVETRAIN_TWEAK[goal]?.[drivetrain]

  const camber = {
    front: preset.camber.f,
    rear:  preset.camber.r + (tweak?.camberRearDelta ?? 0),
  }
  const toe = {
    front: preset.toe.f + (tweak?.toeFrontDelta ?? 0),
    rear:  preset.toe.r,
  }

  return { camber, toe, caster: preset.caster }
}

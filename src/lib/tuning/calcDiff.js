// Differential settings (accel & decel lock %, FH6 0–100 scale).
// Source: FATTY reference (Nissan Silvia K's) + FH6 physics.
//
// Accel diff (on throttle): higher % = more lock = traction, but oversteer (RWD)
// or understeer-fighting pull (FWD). Decel diff (off throttle): higher % = more
// braking stability, but understeer on lift-off. FWD needs HIGH accel lock to
// fight front-axle understeer; on RWD a loose surface snaps with high lock, so
// rally/off-road run minimal lock. AWD splits front/rear with a centre bias:
// the more rearward (rear_pct), the more RWD-like the car behaves.

// Goal -> diff group. Specific goals collapse to 5 groups; a group name passed
// directly (e.g. 'road_racing') maps to itself.
const GOAL_GROUP = {
  cornering: 'road_racing',
  circuit:   'road_racing',
  touge:     'road_racing',
  balanced:  'road_racing',
  speed:     'road_racing',
  rally:     'rally',
  offroad:   'offroad',
  drift:     'drift',
  drag:      'drag',
  road_racing: 'road_racing',
}

export function getDiffGoalGroup(goal) {
  return GOAL_GROUP[goal] ?? 'road_racing'
}

// Per-drivetrain x group defaults. RWD/FWD return { accel, decel };
// AWD returns { front:{accel,decel}, rear:{accel,decel}, center:{rear_pct} }.
const DIFF_GOAL_DEFAULTS = {
  RWD: {
    road_racing: { accel: 50,  decel: 30 }, // balanced: traction out + braking stability (FATTY default)
    rally:       { accel: 8,   decel: 15 }, // FATTY: loose surface snaps under lock -> minimal accel
    offroad:     { accel: 8,   decel: 15 }, // FATTY: same loose-surface reasoning as rally
    drift:       { accel: 100, decel: 10 }, // FATTY: max lock sustains the slide, low decel frees the tail
    drag:        { accel: 85,  decel: 5  }, // FATTY: high lock for straight-line traction, minimal decel
  },
  FWD: {
    road_racing: { accel: 85, decel: 10 }, // FATTY ~80-95: high front lock fights corner-exit understeer
    rally:       { accel: 70, decel: 10 }, // lock helps FWD pull on loose, eased to avoid mid-corner push
    offroad:     { accel: 70, decel: 10 }, // same as rally on very loose surfaces
    drift:       { accel: 55, decel: 10 }, // FWD "drift" is lift-off/handbrake rotation -> lower lock
    drag:        { accel: 90, decel: 5  }, // near-max front lock for launch traction
  },
  AWD: {
    // center.rear_pct: higher = more rearward = more RWD-like.
    road_racing: { front: { accel: 40, decel: 15 }, rear: { accel: 50, decel: 30 }, center: { rear_pct: 80 } }, // FATTY centre ~80: rear-biased RWD-like rotation
    rally:       { front: { accel: 40, decel: 15 }, rear: { accel: 45, decel: 20 }, center: { rear_pct: 55 } }, // even-ish centre for loose-surface traction
    offroad:     { front: { accel: 40, decel: 15 }, rear: { accel: 45, decel: 20 }, center: { rear_pct: 50 } }, // most even split for max grip on very loose terrain
    drift:       { front: { accel: 30, decel: 10 }, rear: { accel: 100, decel: 10 }, center: { rear_pct: 90 } }, // heavy rear bias mimics RWD drift; rear fully locked
    drag:        { front: { accel: 80, decel: 5 }, rear: { accel: 85, decel: 5 }, center: { rear_pct: 55 } }, // lock both axles hard for launch, slight rear bias
  },
}

// Deep copy so callers can't mutate the shared defaults.
function cloneDiff(v) {
  return v.center
    ? { front: { ...v.front }, rear: { ...v.rear }, center: { ...v.center } }
    : { ...v }
}

// car: { stock_drivetrain }; goal: one of the 9 goal keys (or a group name).
export function calcDiff(car, goal) {
  const drivetrain = car?.stock_drivetrain ?? 'RWD'
  const group      = getDiffGoalGroup(goal)
  const table      = DIFF_GOAL_DEFAULTS[drivetrain] ?? DIFF_GOAL_DEFAULTS.RWD
  return cloneDiff(table[group] ?? table.road_racing)
}

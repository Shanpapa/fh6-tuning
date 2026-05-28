// ── FH6 CONSTANTS ─────────────────────────────────────────

export const CLASSES = ['D','C','B','A','S1','S2','R','X']

export const CLASS_RANGES = {
  D:  [100, 400],
  C:  [401, 500],
  B:  [501, 600],
  A:  [601, 700],
  S1: [701, 800],
  S2: [801, 900],
  R:  [901, 998],
  X:  [999, 9999],
}

// Derive class from PI — returns null if out of range
export function classFromPi(pi) {
  const n = parseInt(pi)
  if (isNaN(n)) return null
  for (const [cls, [min, max]] of Object.entries(CLASS_RANGES)) {
    if (n >= min && n <= max) return cls
  }
  return null
}

export const DRIVETRAINS = ['RWD', 'FWD', 'AWD']

export const GOALS = ['race_circuit', 'race_sprint', 'drift', 'drag', 'rally', 'offroad']

// Display names + descriptions for each goal
export const GOAL_INFO = {
  race_circuit: { label: 'Race — Circuit', short: 'Circuit', desc: 'Closed track, corners & braking' },
  race_sprint:  { label: 'Race — Sprint',  short: 'Sprint',  desc: 'Open road, top speed & power' },
  drift:        { label: 'Drift',          short: 'Drift',   desc: 'Sustained controllable slides' },
  drag:         { label: 'Drag',           short: 'Drag',    desc: 'Straight-line launch & speed' },
  rally:        { label: 'Rally',          short: 'Rally',   desc: 'Mixed surface, dirt & tarmac' },
  offroad:      { label: 'Off-Road',       short: 'Offroad', desc: 'Rough terrain, max traction' },
}

// Badge colors per goal
export const GOAL_COLORS = {
  race_circuit: '#38bdf8',
  race_sprint:  '#0ea5e9',
  drift:        '#f97316',
  drag:         '#a78bfa',
  rally:        '#4ade80',
  offroad:      '#f87171',
}

// Tire pressure by compound (FH6 — one decimal only)
export const PSI = {
  stock:      1.9,
  street:     1.9,
  sport:      1.9,
  rally:      1.9,
  semi_slick: 2.2,
  race_slick: 2.2,
  drift:      2.2,
  off_road:   1.8,
  drag:       1.4,
}

export const COMPOUNDS = Object.keys(PSI)

// Target natural frequency by compound (Hz)
// Source: co-driver (MIT) — calibrated for FH6 game slider ranges
// FH6 spring sliders use N/mm × 10 internally (N/cm labelled as N/mm, Forza bug since 2015)
// Our formula outputs true-physics N/mm; tuning.js multiplies by 10 before displaying.
export const TARGET_HZ = {
  off_road:   1.69,   // co-driver crosscountry baseline
  rally:      1.94,   // co-driver dirt baseline
  street:     2.10,   // softer road (locked in-game anyway)
  sport:      2.42,   // co-driver road/sport — game range: 454–2271 N/mm
  drift:      2.20,   // drift springs — semi-slick-ish feel
  semi_slick: 2.70,
  race_slick: 3.00,
}

// FH6 spring slider ranges (game N/mm = true N/mm × 10)
export const SPRING_RANGE = { min: 454.3, max: 2271.7 }

// Suspension types: determines if spring/damper sliders are adjustable
export const SUSPENSION_TYPES = {
  stock:   { label: 'Stock',   adjustable: false },
  street:  { label: 'Street',  adjustable: false },
  sport:   { label: 'Sport',   adjustable: false },
  race:    { label: 'Race',    adjustable: true  },
  drift:   { label: 'Drift',   adjustable: true  },
  rally:   { label: 'Rally',   adjustable: true  },
  offroad: { label: 'Off-Road',adjustable: true  },
}

// Mechanical balance target range
export const MECH_BALANCE = { min: 0.55, max: 0.65 }

// Aero balance target range
export const AERO_BALANCE = { min: 0.45, max: 0.55 }  // FH6 confirmed: ~0.50 target

// Default caster
export const DEFAULT_CASTER = 6.0  // FH6 confirmed: 5.5–6.5°, above 6.0 causes snap

// Diff defaults by drivetrain/goal
export const DIFF_DEFAULTS = {
  RWD:   { accel: 50, decel: 30 },   // FH6: 40-60% accel, 20-40% decel
  FWD:   { accel: 25, decel: 5  },   // FH6: 20-30% accel, 0-10% decel
  AWD:   {
    front:  { accel: 25, decel: 5  }, // FH6 FWD values for front
    rear:   { accel: 50, decel: 30 }, // FH6 RWD values for rear
    center: { rear_pct: 65 },         // FH6: 60-70% rear
  },
  drift: { accel: 100, decel: 15 },
}

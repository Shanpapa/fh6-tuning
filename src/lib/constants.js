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

export const GOALS = ['race', 'drift', 'drag', 'rally', 'hillclimb', 'offroad']

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
export const TARGET_HZ = {
  off_road:   1.3,
  rally:      1.4,
  street:     1.65,
  sport:      1.9,
  semi_slick: 2.2,
  race_slick: 2.5,
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

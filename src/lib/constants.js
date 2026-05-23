// ── FH6 CONSTANTS ─────────────────────────────────────────

export const CLASSES = ['D','C','B','A','S1','S2','X']

export const CLASS_RANGES = {
  D:  [100, 500],
  C:  [501, 600],
  B:  [601, 700],
  A:  [701, 800],
  S1: [801, 900],
  S2: [901, 998],
  R:  [998, 998],
  X:  [999, 9999],
}

export const DRIVETRAINS = ['RWD', 'FWD', 'AWD']

export const GOALS = ['race', 'drift', 'drag', 'rally']

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
export const AERO_BALANCE = { min: 0.40, max: 0.45 }

// Default caster
export const DEFAULT_CASTER = 7.0

// Diff defaults by drivetrain/goal
export const DIFF_DEFAULTS = {
  RWD:   { accel: 55, decel: 15 },
  FWD:   { accel: 85, decel: 0  },
  AWD:   {
    front:  { accel: 85, decel: 0  },
    rear:   { accel: 55, decel: 15 },
    center: { rear_pct: 75 },        // 70–80% rear
  },
  drift: { accel: 100, decel: 15 },
}

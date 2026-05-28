// ── FH6 TUNING FORMULAS ───────────────────────────────────
// Spring/damper/ARB/caster formulas adapted from co-driver (MIT)
// github.com/Ojansen/co-driver — with FH6-specific adjustments
import { PSI, TARGET_HZ, DIFF_DEFAULTS, DEFAULT_CASTER } from './constants.js'

const UNSPRUNG_RATIO   = 0.13  // fraction of total mass (wheels, brakes, arms)
const FREQ_REAR_OFFSET = 0.2   // rear Hz higher than front for flat-ride tuning

// Reference build for damper scaling (co-driver anchor)
const REF_WEIGHT_KG  = 1400
const REF_FRONT_PCT  = 0.48
const REF_SPRUNG_F   = REF_WEIGHT_KG * (1 - UNSPRUNG_RATIO) * REF_FRONT_PCT / 2
const REF_SPRUNG_R   = REF_WEIGHT_KG * (1 - UNSPRUNG_RATIO) * (1 - REF_FRONT_PCT) / 2
const DAMPER_BUMP_BASE    = 8
const DAMPER_REBOUND_BASE = 11

// ARB baselines by drivetrain (1–65 scale, from forza.tools via co-driver)
const ARB_BASE = {
  RWD: { front: 22, rear: 30 },
  AWD: { front: 26, rear: 33 },
  FWD: { front: 12, rear: 32 },
}

// Caster interpolation table by weight (lb) — co-driver / forza.tools
const CASTER_TABLE = [
  [2500, 5.2],
  [3000, 6.0],
  [3500, 6.5],
  [4500, 7.0],
]

function lerpTable(table, x) {
  if (x <= table[0][0]) return table[0][1]
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1]
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i]; const [x1, y1] = table[i + 1]
    if (x >= x0 && x <= x1) return y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
  }
  return table[table.length - 1][1]
}

// Damper: rebound = bump × 1.5 (FH6 confirmed)
export function calcRebound(bump) {
  return Math.round((bump * 1.5) * 10) / 10
}

// Spring rate — natural frequency method (N/mm)
// Uses co-driver's cleaner formula (no PI scalar)
export function calcSpringRates({ compound, weight_kg, front_pct }) {
  const f = TARGET_HZ[compound] ?? 1.9
  const sprung_total = weight_kg * (1 - UNSPRUNG_RATIO)
  const sprung_f = sprung_total * front_pct / 2
  const sprung_r = sprung_total * (1 - front_pct) / 2
  const k_front = (Math.pow(2 * Math.PI * f, 2) * sprung_f) / 1000
  const k_rear  = (Math.pow(2 * Math.PI * (f + FREQ_REAR_OFFSET), 2) * sprung_r) / 1000
  return {
    front: Math.round(k_front * 10) / 10,
    rear:  Math.round(k_rear  * 10) / 10,
  }
}

// Damper bump — scaled by sprung mass relative to reference build
export function calcDampers(weight_kg, front_pct) {
  const sprung_f = weight_kg * (1 - UNSPRUNG_RATIO) * front_pct / 2
  const sprung_r = weight_kg * (1 - UNSPRUNG_RATIO) * (1 - front_pct) / 2
  const scale_f = Math.sqrt(sprung_f / REF_SPRUNG_F)
  const scale_r = Math.sqrt(sprung_r / REF_SPRUNG_R)
  return {
    bump_f:    Math.round(DAMPER_BUMP_BASE    * scale_f * 10) / 10,
    bump_r:    Math.round(DAMPER_BUMP_BASE    * scale_r * 10) / 10,
    rebound_f: Math.round(DAMPER_REBOUND_BASE * scale_f * 10) / 10,
    rebound_r: Math.round(DAMPER_REBOUND_BASE * scale_r * 10) / 10,
  }
}

// ARB baseline — drivetrain + weight distribution aware
export function calcARB(drivetrain, front_pct_decimal) {
  const base = ARB_BASE[drivetrain] ?? ARB_BASE.RWD
  // Front shifts by (front% - 50) × drivetrain factor
  const factor = drivetrain === 'FWD' ? -1.0 : drivetrain === 'AWD' ? 0.66 : 1.0
  const front_pct = front_pct_decimal * 100
  const arb_f = Math.round(Math.max(1, Math.min(65, base.front + (front_pct - 50) * factor)))
  const arb_r = Math.round(Math.max(1, Math.min(65, base.rear)))
  return { arb_f, arb_r }
}

// Caster — weight-based interpolation
export function calcCaster(weight_kg) {
  const weight_lb = weight_kg * 2.20462
  return Math.round(lerpTable(CASTER_TABLE, weight_lb) * 10) / 10
}

// Final drive baseline
export function calcFinalDrive({ power_hp, drivetrain, stock_drivetrain }) {
  let hp = power_hp
  if (hp <= 200) hp = hp * 2
  if (hp >= 800) hp = hp / 2
  let fd = 4.25 + ((400 - hp) / 6) * 0.01
  if (drivetrain === 'AWD' && stock_drivetrain !== 'AWD') fd -= 1.0
  else if (drivetrain === 'RWD' && stock_drivetrain !== 'RWD') fd -= 0.5
  return Math.round(Math.max(fd, 1.5) * 100) / 100
}

// Tire pressure by compound
export function getTirePressure(compound) {
  return PSI[compound] ?? 1.9
}

// Diff defaults
export function getDiffDefaults(drivetrain, goal) {
  if (goal === 'drift') return DIFF_DEFAULTS.drift
  return DIFF_DEFAULTS[drivetrain] ?? DIFF_DEFAULTS.RWD
}

// Normalise old goal values to new 6-key system
export function normaliseGoal(goal) {
  if (!goal) return 'race_circuit'
  if (goal === 'race' || goal === 'hillclimb') return 'race_circuit'
  return goal
}

// Generate full baseline tune from build params
export function calcBaselineTune({
  weight_kg,
  front_pct,
  pi,         // kept for API compatibility, no longer used in spring formula
  compound,
  drivetrain,
  stock_drivetrain,
  power_hp,
  goal,
}) {
  const springs = calcSpringRates({ compound, weight_kg, front_pct })
  const dampers = calcDampers(weight_kg, front_pct)
  const arb     = calcARB(drivetrain, front_pct)
  const caster  = calcCaster(weight_kg)
  const psi     = getTirePressure(compound)
  const fd      = calcFinalDrive({ power_hp, drivetrain, stock_drivetrain })
  const diff    = getDiffDefaults(drivetrain, goal)

  return {
    tire_pressure_f: psi,
    tire_pressure_r: psi,
    spring_rate_f: springs.front,
    spring_rate_r: springs.rear,
    bump_f:    dampers.bump_f,
    bump_r:    dampers.bump_r,
    rebound_f: dampers.rebound_f,
    rebound_r: dampers.rebound_r,
    caster,
    camber_f: -1.0,
    camber_r: -0.5,
    toe_f: 0.0,
    toe_r: 0.0,
    aero_balance: 0.50,
    diff_accel: diff.accel ?? diff.front?.accel ?? 55,
    diff_decel: diff.decel ?? diff.front?.decel ?? 15,
    final_drive: fd,
    arb_f: arb.arb_f,
    arb_r: arb.arb_r,
  }
}
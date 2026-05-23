// ── FH6 TUNING FORMULAS ───────────────────────────────────
import { PSI, TARGET_HZ, DIFF_DEFAULTS, DEFAULT_CASTER } from './constants.js'

// Damper: rebound = bump / 0.4
export function calcRebound(bump) {
  return Math.round((bump / 0.4) * 10) / 10
}

// Spring rate baseline (natural frequency method)
// compound: key from TARGET_HZ
// weight_kg: total car weight
// front_pct: front weight distribution (0.0–1.0)
// pi: current PI value
export function calcSpringRates({ compound, weight_kg, front_pct, pi }) {
  const f = TARGET_HZ[compound] ?? 1.65
  const sprung = weight_kg * 0.85
  const pi_scalar = 20 + (pi / 1000) * 17

  const front_corner = (sprung * front_pct) / 2
  const rear_corner  = (sprung * (1 - front_pct)) / 2

  const k_front = (front_corner * Math.pow(2 * Math.PI * f, 2) * pi_scalar) / 1000
  const k_rear  = (rear_corner  * Math.pow(2 * Math.PI * f, 2) * pi_scalar) / 1000

  return {
    front: Math.round(k_front * 10) / 10,
    rear:  Math.round(k_rear  * 10) / 10,
  }
}

// Final drive baseline
// power_hp: effective power at wheels
// drivetrain: 'RWD'|'FWD'|'AWD'
// stock_drivetrain: original drivetrain
export function calcFinalDrive({ power_hp, drivetrain, stock_drivetrain }) {
  let hp = power_hp
  if (hp <= 200) hp = hp * 2
  if (hp >= 800) hp = hp / 2

  let fd = 4.25 + ((400 - hp) / 6) * 0.01

  // Drivetrain swap penalties
  if (drivetrain === 'AWD' && stock_drivetrain !== 'AWD') fd -= 1.0
  else if (drivetrain === 'RWD' && stock_drivetrain !== 'RWD') fd -= 0.5

  return Math.round(Math.max(fd, 1.5) * 100) / 100
}

// Tire pressure by compound (one decimal, FH6)
export function getTirePressure(compound) {
  return PSI[compound] ?? 1.9
}

// Diff defaults
export function getDiffDefaults(drivetrain, goal) {
  if (goal === 'drift') return DIFF_DEFAULTS.drift
  return DIFF_DEFAULTS[drivetrain] ?? DIFF_DEFAULTS.RWD
}

// Generate full baseline tune from build params
export function calcBaselineTune({
  weight_kg,
  front_pct,       // e.g. 0.52
  pi,
  compound,
  drivetrain,
  stock_drivetrain,
  power_hp,
  goal,
}) {
  const springs = calcSpringRates({ compound, weight_kg, front_pct, pi })

  // Bump stiffness: start at ~40% of spring rate
  const bump_front  = Math.round(springs.front * 0.12 * 10) / 10
  const bump_rear   = Math.round(springs.rear  * 0.12 * 10) / 10

  const psi = getTirePressure(compound)
  const fd  = calcFinalDrive({ power_hp, drivetrain, stock_drivetrain })
  const diff = getDiffDefaults(drivetrain, goal)

  return {
    // Tires
    tire_pressure_f: psi,
    tire_pressure_r: psi,
    // Springs
    spring_rate_f: springs.front,
    spring_rate_r: springs.rear,
    // Dampers
    bump_f:    bump_front,
    bump_r:    bump_rear,
    rebound_f: calcRebound(bump_front),
    rebound_r: calcRebound(bump_rear),
    // Alignment
    caster: DEFAULT_CASTER,
    camber_f: -1.0,
    camber_r: -0.5,
    toe_f: 0.0,
    toe_r: 0.2,
    // Aero
    aero_balance: 0.42,   // middle of 0.40–0.45 target
    // Diff
    diff_accel: diff.accel ?? diff.front?.accel ?? 55,
    diff_decel: diff.decel ?? diff.front?.decel ?? 15,
    // Final drive
    final_drive: fd,
    // ARB (start at mid, user adjusts to 0.55–0.65 mech balance)
    arb_f: 5.0,
    arb_r: 5.0,
  }
}

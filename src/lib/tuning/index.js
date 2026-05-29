export { calcARB }         from './calcARB.js'
export { calcDampers }     from './calcDampers.js'
export { calcSpringRates } from './calcSpringRates.js'
export { calcAlignment }   from './calcAlignment.js'
export { calcFinalDrive }  from './calcFinalDrive.js'

import { calcSpringRates } from './calcSpringRates.js'
import { calcDampers }     from './calcDampers.js'
import { calcARB }         from './calcARB.js'
import { calcAlignment }   from './calcAlignment.js'
import { calcFinalDrive }  from './calcFinalDrive.js'

// car: { front_weight_pct, suspension_type, stock_drivetrain, max_rpm, base_stats: { weight_kg, power_hp } }
// goal: one of the 9 goal keys
export function calculateTune(car, goal) {
  const frontPct    = parseFloat(car.front_weight_pct ?? 52)
  const suspType    = car.suspension_type ?? 'Stock'
  const drivetrain  = car.stock_drivetrain ?? 'RWD'
  const weightKg    = car.base_stats?.weight_kg ?? 1200
  const powerHp     = car.base_stats?.power_hp  ?? 200
  const maxRpm      = car.max_rpm ?? 7000

  const springs  = calcSpringRates(weightKg, frontPct, suspType, goal)
  const dampers  = calcDampers(springs.front, springs.rear, goal)
  const arb      = calcARB(drivetrain, frontPct / 100, goal)
  const alignment = calcAlignment(goal, drivetrain)
  const { finalDrive } = calcFinalDrive(powerHp, maxRpm, goal)

  return { springs, dampers, arb, alignment, finalDrive }
}

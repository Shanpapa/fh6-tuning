export { calcARB }          from './calcARB.js'
export { calcDampers }      from './calcDampers.js'
export { calcSpringRates }  from './calcSpringRates.js'
export { calcAlignment }    from './calcAlignment.js'
export { calcFinalDrive }   from './calcFinalDrive.js'
export { calcDiff }         from './calcDiff.js'
export { calcTirePressure } from './calcTirePressure.js'

import { calcSpringRates }  from './calcSpringRates.js'
import { calcDampers }      from './calcDampers.js'
import { calcARB }          from './calcARB.js'
import { calcAlignment }    from './calcAlignment.js'
import { calcFinalDrive }   from './calcFinalDrive.js'
import { calcDiff }         from './calcDiff.js'
import { calcTirePressure } from './calcTirePressure.js'

// Aero balance — front downforce bias (D/2f decision: goal-specific table,
// FATTY baseline 0.42; higher = more front-biased = more understeer per FATTY).
// NOTE: semantics still to be confirmed against the real FH6 aero slider in
// D/2i validation; documented fallback is a flat 0.50 if understeer shows up.
const AERO_BALANCE = {
  circuit:   0.42,
  cornering: 0.42,
  touge:     0.42,
  balanced:  0.44,
  speed:     0.45,
  rally:     0.44,
  offroad:   0.44,
  drift:     0.40,
  drag:      0.50,
}

export function calcAero(goal) {
  return AERO_BALANCE[goal] ?? 0.44
}

// car:      { front_weight_pct, suspension_type, stock_drivetrain, stock_pi,
//             base_stats: { weight_kg, power_hp }, tyre_compound_stock }
// compound: tyre compound string (e.g. 'Standard', 'Sport', 'Race Slick')
// goal:     one of the 9 goal keys
export function calculateTune(car, compound, goal) {
  const springs      = calcSpringRates(car, compound)
  const dampers      = calcDampers(springs, car, goal)
  const arb          = calcARB(car, goal)
  const alignment    = calcAlignment(goal, car.stock_drivetrain)
  const finalDrive   = calcFinalDrive(car.base_stats?.power_hp, car.stock_drivetrain)
  const diff         = calcDiff(car, goal)
  const tirePressure = calcTirePressure(compound, goal)
  const aero         = calcAero(goal)

  return { springs, dampers, arb, alignment, finalDrive, diff, tirePressure, aero }
}

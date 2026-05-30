// Physics-based spring rates (N/mm, FH6 in-game range).
// Source: co-driver MIT quarter-car formula + FH6 in-game validation.
//
// Target ride frequencies per tyre compound. `compound` is tyre_compound_stock
// (e.g. 'Standard', 'Sport', 'Race Slick'); 'Standard' is the fallback bucket.
const TARGET_HZ = {
  'Stock':      1.65,
  'Street':     1.65,
  'Standard':   1.65,   // tyre_compound_stock fallback
  'Sport':      2.42,
  'Semi-Slick': 2.42,
  'Drift':      2.42,
  'Race Slick': 2.5,
  'Rally':      1.4,
  'Off-Road':   1.3,
}

const SPRING_RANGE = { min: 454, max: 2271 }

// Empirical scale from the physics quarter-car stiffness to FH6's in-game spring
// units. The co-driver note nominally used "x10", but combined with PI_scalar
// (~27.7) that over-scales ~12.6x and pins every car to the 2271 ceiling.
// Calibrated instead to the validated in-game Silvia datapoint
// (Standard compound, PI 455 -> front ~618 / rear ~530 N/mm).  D/2b
const GAME_SCALE = 0.794

// compound = tyre_compound_stock (pl. 'Standard', 'Sport', 'Race Slick')
export function calcSpringRates(car, compound) {
  const weight_kg = car.base_stats?.weight_kg || 1200
  const front_pct = parseFloat(car.front_weight_pct || 52) / 100
  const PI        = car.stock_pi || 500

  const sprung       = weight_kg * 0.85
  const front_corner = (sprung * front_pct) / 2
  const rear_corner  = (sprung * (1 - front_pct)) / 2
  const PI_scalar    = 20 + (PI / 1000) * 17
  const hz           = TARGET_HZ[compound] || 1.65

  const calc = (corner) => {
    const K_true = (corner * Math.pow(2 * Math.PI * hz, 2) * PI_scalar) / 1000
    return Math.round(Math.max(SPRING_RANGE.min, Math.min(SPRING_RANGE.max, K_true * GAME_SCALE)))
  }

  return { front: calc(front_corner), rear: calc(rear_corner) }
}

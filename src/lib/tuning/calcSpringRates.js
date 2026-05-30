// Physics-based spring rates (N/mm, FH6 in-game range).
// Pure quarter-car: K = (2*pi*f)^2 * sprung_corner_mass, scaled to FH6 units.
// Source: co-driver MIT formula + FH6 in-game validation.
//
// Target ride frequencies per tyre compound. `compound` is tyre_compound_stock
// (e.g. 'Standard', 'Sport', 'Race Slick'); 'Standard' maps to the sport bucket.
const TARGET_HZ = {
  'Stock': 1.65, 'Street': 1.65, 'Standard': 2.42,
  'Sport': 2.42, 'Semi-Slick': 2.42, 'Drift': 2.42,
  'Race Slick': 2.5, 'Rally': 1.4, 'Off-Road': 1.3,
}
const SPRING_RANGE = { min: 454, max: 2271 }
const UNSPRUNG_RATIO = 0.13

export function calcSpringRates(car, compound) {
  const weight_kg = car.base_stats?.weight_kg || 1200
  const front_pct = parseFloat(car.front_weight_pct || 52) / 100
  const hz = TARGET_HZ[compound] ?? 2.42

  const sprung_f = weight_kg * (1 - UNSPRUNG_RATIO) * front_pct / 2
  const sprung_r = weight_kg * (1 - UNSPRUNG_RATIO) * (1 - front_pct) / 2

  const K_f = (Math.pow(2 * Math.PI * hz, 2) * sprung_f) / 1000
  const K_r = (Math.pow(2 * Math.PI * hz, 2) * sprung_r) / 1000

  const clamp = (v) => Math.round(Math.max(SPRING_RANGE.min, Math.min(SPRING_RANGE.max, v * 10)) * 10) / 10
  return { front: clamp(K_f), rear: clamp(K_r) }
}

// How much of top speed each goal targets at the rev limiter
// Lower ratio = shorter gearing = more torque delivery
const GOAL_SPEED_RATIO = {
  cornering: 0.78,
  balanced:  0.80,
  speed:     0.95,
  circuit:   0.82,
  touge:     0.72,
  rally:     0.75,
  offroad:   0.65,
  drift:     0.62,
  drag:      0.90,
}

// Returns { finalDrive } as a ratio in the 2.50–6.00 FH range
export function calcFinalDrive(power_hp, max_rpm, goal) {
  const hp    = power_hp ?? 200
  const rpm   = max_rpm  ?? 7000
  const ratio = GOAL_SPEED_RATIO[goal] ?? 0.80

  // More power → needs longer gears (lower FD). Higher RPM → slightly longer.
  const powerFactor = Math.sqrt(200 / Math.max(hp,  100))
  const rpmFactor   = rpm / 7000

  const raw = 2.80 * powerFactor * rpmFactor / ratio
  const fd  = Math.min(6.00, Math.max(2.50, Math.round(raw * 100) / 100))

  return { finalDrive: fd }
}

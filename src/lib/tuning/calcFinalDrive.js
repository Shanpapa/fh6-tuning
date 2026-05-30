// Final drive ratio.
// Source: FATTY reference + FH6 in-game validation.
// AWD correction: -1.0 offset relative to the RWD/FWD baseline.

export function calcFinalDrive(power_hp, drivetrain) {
  let p = power_hp
  if (p <= 200) p *= 2
  if (p >= 800) p /= 2
  let fd = 4.25 + ((400 - p) / 6) * 0.01
  if (drivetrain === 'AWD') fd -= 1.0
  return Math.max(2.0, Math.min(6.5, parseFloat(fd.toFixed(2))))
}

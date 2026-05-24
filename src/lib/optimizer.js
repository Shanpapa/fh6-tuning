// ── FH6 BUILD OPTIMIZER ───────────────────────────────────
// Guide-driven value/PI optimisation with subcategory grouping.
//
// Model:
//   stat_value   = Σ(effects[stat] × goal_weight.stats[stat])
//   unlock_value = unlocks_tuning ? goal_weight.unlocks[unlock_type] : 0
//   total_value  = stat_value + unlock_value
//
// Constraint: one part per subcategory, Σ pi_change ≤ piCap (X class = no cap)
// Algorithm: multiple-choice knapsack via DP over PI budget.

// Score a single part for a given goal's weights
export function scorePart(part, weights) {
  const effects = part.effects || {}
  let statValue = 0
  for (const [stat, w] of Object.entries(weights.stats || {})) {
    const v = effects[stat]
    if (typeof v === 'number') statValue += v * w
  }
  let unlockValue = 0
  if (effects.unlocks_tuning && effects.unlock_type) {
    unlockValue = weights.unlocks?.[effects.unlock_type] ?? 0
  }
  return statValue + unlockValue
}

// Group parts by subcategory (fallback to category, then 'Other')
function groupBySubcategory(parts) {
  const groups = {}
  for (const p of parts) {
    const key = p.subcategory || p.category || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return groups
}

// Main optimiser
// parts: array of car_parts rows for ONE car
// weights: { stats:{}, unlocks:{} } for the chosen goal
// piCap: integer target PI cap
// isXClass: if true, no upper PI limit
//
// returns { selected:[parts], totalPi, totalScore, breakdown:[{subcat, part, score, pi}] }
export function optimize(parts, weights, piCap, isXClass = false) {
  if (!parts || parts.length === 0) {
    return { selected: [], totalPi: 0, totalScore: 0, breakdown: [], empty: true }
  }

  const groups = groupBySubcategory(parts)
  const subcats = Object.keys(groups)

  // For each subcategory build option list.
  // Each option: { part|null, pi, score }
  // null option = "install nothing in this subcategory" (pi 0, score 0)
  const optionSets = subcats.map(subcat => {
    const opts = groups[subcat].map(p => ({
      part: p,
      pi: p.pi_change || 0,
      score: scorePart(p, weights),
    }))
    // Always allow choosing nothing (the stock/empty baseline)
    opts.push({ part: null, pi: 0, score: 0 })
    return { subcat, opts }
  })

  // ── X class: no PI limit — just pick best-scoring option per subcategory
  if (isXClass) {
    const breakdown = []
    let totalPi = 0, totalScore = 0
    const selected = []
    for (const { subcat, opts } of optionSets) {
      const best = opts.reduce((a, b) => (b.score > a.score ? b : a))
      if (best.part) {
        selected.push(best.part)
        totalPi += best.pi
        totalScore += best.score
        breakdown.push({ subcat, part: best.part, score: best.score, pi: best.pi })
      }
    }
    return { selected, totalPi, totalScore, breakdown }
  }

  // ── Bounded knapsack with PI budget.
  // pi_change can be negative (weight reduction); offset the DP index.
  // Compute min possible cumulative PI (sum of most-negative options) for offset.
  let minPi = 0, maxPi = 0
  for (const { opts } of optionSets) {
    const pis = opts.map(o => o.pi)
    minPi += Math.min(...pis)
    maxPi += Math.max(...pis)
  }
  // Budget ceiling is piCap, floor is minPi (could be < 0)
  const offset = minPi < 0 ? -minPi : 0
  const cap = piCap + offset
  const size = cap + 1

  // dp[b] = best total score achievable using exactly budget index b (pi = b - offset)
  // track[subcatIndex][b] = chosen option index to reconstruct
  const NEG = -Infinity
  let dp = new Array(size).fill(NEG)
  dp[offset] = 0 // pi = 0 start
  const track = []

  optionSets.forEach(({ opts }, si) => {
    const next = new Array(size).fill(NEG)
    const choice = new Array(size).fill(-1)
    for (let b = 0; b < size; b++) {
      if (dp[b] === NEG) continue
      for (let oi = 0; oi < opts.length; oi++) {
        const nb = b + opts[oi].pi
        if (nb < 0 || nb >= size) continue
        const val = dp[b] + opts[oi].score
        if (val > next[nb]) {
          next[nb] = val
          choice[nb] = (b << 8) | oi // pack prev budget + option index
        }
      }
    }
    dp = next
    track.push(choice)
  })

  // Find best score at any budget ≤ piCap (i.e. index ≤ cap)
  let bestB = -1, bestScore = NEG
  for (let b = 0; b <= cap; b++) {
    if (dp[b] > bestScore) { bestScore = dp[b]; bestB = b }
  }
  if (bestB < 0) {
    return { selected: [], totalPi: 0, totalScore: 0, breakdown: [] }
  }

  // Reconstruct
  const chosenOpts = []
  let b = bestB
  for (let si = track.length - 1; si >= 0; si--) {
    const packed = track[si][b]
    const oi = packed & 0xff
    const prevB = packed >> 8
    chosenOpts[si] = oi
    b = prevB
  }

  const selected = []
  const breakdown = []
  let totalPi = 0, totalScore = 0
  optionSets.forEach(({ subcat, opts }, si) => {
    const opt = opts[chosenOpts[si]]
    if (opt && opt.part) {
      selected.push(opt.part)
      totalPi += opt.pi
      totalScore += opt.score
      breakdown.push({ subcat, part: opt.part, score: opt.score, pi: opt.pi })
    }
  })

  // Sort breakdown by score descending for display
  breakdown.sort((a, b) => b.score - a.score)

  return { selected, totalPi, totalScore, breakdown }
}

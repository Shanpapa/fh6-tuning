// ── FH6 DIAGNOSTIC KNOWLEDGE BASE ─────────────────────────
// Each category: questions → ranked recommendations
// Recommendation types: TUNE | UPGRADE | CHECK

// ── Recommendation builder ─────────────────────────────────
const rec = (type, param, action, why, priority = 1) =>
  ({ type, param, action, why, priority })

// ── UNDERSTEER ─────────────────────────────────────────────
function getUndersteerRecs({ when, speed, severity }) {
  const recs = []

  if (when === 'entry') {
    recs.push(
      rec('TUNE',    'Brake Bias',      'Move rearward (less front)',               'Too much front brake force pushes the nose wide on entry',            1),
      rec('TUNE',    'Front Rebound',   'Decrease — allow faster weight transfer',  'Slow rebound holds the front up, reducing front grip on turn-in',     2),
      rec('TUNE',    'Front Spring',    'Soften slightly',                          'Too stiff a front spring prevents the tire from loading correctly',   3),
      rec('TUNE',    'Front Toe',       'Add slight toe-out (−0.1° to −0.2°)',      'Toe-out improves turn-in response on corner entry',                   4),
    )
  }

  if (when === 'mid') {
    recs.push(
      rec('TUNE',    'Front ARB',       'Soften — or stiffen Rear ARB',             'Shifting balance rear-relative increases front mechanical grip',       1),
      rec('TUNE',    'Front Camber',    'Increase negative (−0.2° to −0.5°)',       'More camber increases contact patch when cornering',                  2),
      rec('TUNE',    'Front Toe',       'Add slight toe-out',                       'Reduces drag and improves mid-corner rotation',                       3),
      rec('UPGRADE', 'Front Tires',     'Upgrade compound (Sport → Semi/Race)',     'Better compound = more mechanical grip, directly reduces understeer',  4),
    )
  }

  if (when === 'exit') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Decrease (FWD/AWD) or check rear (RWD)',   'Locked diff on exit pushes the nose wide instead of rotating',        1),
      rec('TUNE',    'Rear ARB',        'Soften — allow more rear roll',            'Softer rear ARB shifts grip balance to the front on exit',            2),
      rec('TUNE',    'Rear Spring',     'Soften slightly',                          'Allows rear to compress and load, improving rotation balance',        3),
      rec('TUNE',    'Throttle',        'Apply more progressively out of corner',   'Abrupt throttle on understeer cars shifts weight off the front',       4),
    )
  }

  if (when === 'all') {
    recs.push(
      rec('UPGRADE', 'Front Tires',     'Upgrade compound',                         'Most impactful single change for chronic understeer',                  1),
      rec('TUNE',    'Front ARB',       'Soften front relative to rear',            'Shifts mechanical balance toward front grip',                         2),
      rec('TUNE',    'Front Camber',    'Increase negative camber front',           'More contact patch area when cornering',                              3),
      rec('TUNE',    'Diff Accel',      'Lower if FWD/AWD',                         'High diff accel on driven front axle fights rotation',                4),
    )
  }

  if (speed === 'high') {
    recs.unshift(
      rec('TUNE',    'Aero Front',      'Increase front downforce',                 'High-speed understeer is often an aero balance issue, not mechanical', 0),
    )
  }

  if (severity === 'extreme') {
    recs.unshift(
      rec('UPGRADE', 'Front Tires',     'Upgrade to Race compound immediately',     'Extreme push usually means the front compound is the limiting factor',  0),
    )
  }

  return dedup(recs)
}

// ── OVERSTEER ──────────────────────────────────────────────
function getOversteerRecs({ when, type }) {
  const recs = []

  if (when === 'entry') {
    recs.push(
      rec('TUNE',    'Rear Rebound',    'Decrease — allow faster rear settle',      'Fast rear rebound keeps the rear loaded during braking, causing rotation', 1),
      rec('TUNE',    'Rear Spring',     'Soften slightly',                          'Stiff rear spring transfers weight forward too aggressively on braking',   2),
      rec('TUNE',    'Diff Decel',      'Decrease (less locking)',                  'High decel locking snaps the rear on trail braking entry',                3),
      rec('TUNE',    'Brake Bias',      'Move forward (more front)',                'Too much rear braking force rotates the car on entry',                    4),
    )
  }

  if (when === 'exit') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Decrease (RWD) — less locking',           'High accel locking spins rear wheels independently, causing snap',        1),
      rec('TUNE',    'Rear ARB',        'Soften — reduce rear stiffness',          'Stiff rear ARB reduces rear grip during lateral load on exit',            2),
      rec('TUNE',    'Rear Spring',     'Soften to allow rear to compress',        'Allows rear tire to stay planted under acceleration load',               3),
      rec('UPGRADE', 'Rear Tires',      'Upgrade rear compound',                   'More rear grip directly reduces power oversteer',                        4),
    )
  }

  if (when === 'liftoff') {
    recs.push(
      rec('TUNE',    'Diff Decel',      'Decrease significantly',                  'High decel locking causes engine-braking rotation on lift-off',           1),
      rec('TUNE',    'Rear Bump',       'Decrease — allow faster initial response','Stiff bump resists rear compression on lift-off weight shift',            2),
      rec('TUNE',    'Throttle',        'Lift off more gradually',                 'Abrupt lift causes a pendulum weight transfer to the rear',               3),
    )
  }

  if (when === 'mid') {
    recs.push(
      rec('TUNE',    'Rear ARB',        'Soften',                                  'Stiff rear ARB reduces rear mechanical grip in constant cornering',       1),
      rec('TUNE',    'Rear Camber',     'Increase negative (−0.2° to −0.5°)',      'More camber increases rear contact patch in corner',                     2),
      rec('TUNE',    'Front ARB',       'Stiffen slightly',                        'Stiffer front shifts balance to understeering side, stabilises mid-corner', 3),
    )
  }

  if (type === 'snap') {
    recs.unshift(
      rec('TUNE',    'Rear Rebound',    'Decrease immediately — this is the most common snap cause', 'Fast rebound launches the rear back up after compression, causing snap', 0),
      rec('TUNE',    'Diff Decel',      'Decrease',                                'Sudden decel locking on trail-off causes snap transitions',               0),
    )
  }

  if (type === 'tank_slapper') {
    recs.unshift(
      rec('TUNE',    'Rear Rebound',    'Decrease significantly',                  'Oscillation is almost always excessive rear rebound fighting itself',     0),
      rec('TUNE',    'Rear Bump',       'Decrease to match rebound ratio',         'Check bump/rebound ratio: rebound = bump × 1.5 (FH6 confirmed)',                         0),
    )
  }

  return dedup(recs)
}

// ── TRACTION LOSS ──────────────────────────────────────────
function getTractionRecs({ where, axle, severity }) {
  const recs = []

  if (where === 'launch') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Increase (RWD: 55→65, AWD rear: 55→70)', 'More accel locking distributes torque to both rear wheels on launch',    1),
      rec('TUNE',    'Final Drive',     'Shorten (increase ratio)',                'Shorter final drive reduces peak torque per gear, easier to manage',     2),
      rec('TUNE',    'Tire Pressure',   'Lower slightly (−0.1 bar)',               'Slightly lower pressure increases contact patch size at launch',          3),
      rec('UPGRADE', 'Tires',           'Upgrade to Semi-Slick or Race compound', 'Drag compound (1.4 bar) for dedicated launch builds',                    4),
    )
  }

  if (where === 'corner_exit') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'RWD: 40–60%, decrease if spinning | FWD: 20–30%', 'Too much lock spins the inside rear on corner exit',                  1),
      rec('TUNE',    'Rear ARB',        'Soften — allow more rear grip',           'Less rear ARB roll stiffness = more rear mechanical grip on exit',       2),
      rec('TUNE',    'Rear Spring',     'Soften slightly',                         'Allows rear to compress fully, maximising contact patch under load',     3),
      rec('TUNE',    'Throttle',        'Apply later and more progressively',      'Rolling into throttle at apex vs hammering it reduces slip angle',       4),
    )
  }

  if (where === 'straight') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Increase — more even power distribution', 'Even lock distributes torque, prevents one-wheel spin',                  1),
      rec('TUNE',    'Final Drive',     'Lengthen slightly',                       'Taller gear reduces peak torque spikes in higher gears',                 2),
      rec('UPGRADE', 'Power Upgrades',  'Check power vs tire compound balance',   'If running race slicks with stock engine: tires are not the issue',      3),
    )
  }

  if (where === 'high_speed') {
    recs.push(
      rec('TUNE',    'Aero Rear',       'Increase rear downforce',                 'High-speed traction loss is often aero — more rear downforce helps',    1),
      rec('TUNE',    'Rear Spring',     'Stiffen for aero platforms',              'Stiffer rear resists aero-induced body rise at speed',                  2),
      rec('TUNE',    'Diff Accel',      'Reduce slightly at high speed',           'Less lock at high speed prevents snap from grip difference side to side', 3),
    )
  }

  if (severity === 'uncontrollable') {
    recs.unshift(
      rec('UPGRADE', 'Tires',           'Upgrade compound — current compound cannot handle power', 'Power-to-grip mismatch is the root cause of uncontrollable spin', 0),
    )
  }

  return dedup(recs)
}

// ── BRAKING ISSUES ─────────────────────────────────────────
function getBrakingRecs({ issue, axle }) {
  const recs = []

  if (issue === 'lockup') {
    if (axle === 'front' || axle === 'both') {
      recs.push(
        rec('TUNE',    'Brake Bias',    'Move rearward — reduce front',            'Front bias too high causes front tires to lock before rear',             1),
        rec('TUNE',    'Front Tire Pressure', 'Check — high pressure reduces grip', 'Over-inflated tires have a smaller contact patch and lock more easily', 2),
        rec('UPGRADE', 'Front Brakes', 'Upgrade brake kit',                        'Better brakes improve modulation, reducing lockup tendency',             3),
      )
    }
    if (axle === 'rear' || axle === 'both') {
      recs.push(
        rec('TUNE',    'Brake Bias',    'Move forward — reduce rear',              'Too much rear brake causes rear lockup and instability',                 1),
        rec('TUNE',    'Diff Decel',    'Reduce — less engine braking to rear',    'High decel locking adds to rear braking force, causing early lockup',    2),
      )
    }
  }

  if (issue === 'instability') {
    recs.push(
      rec('TUNE',    'Rear Bump',       'Soften — allow rear to absorb weight shift', 'Stiff rear bump transmits braking force unevenly',                   1),
      rec('TUNE',    'Rear Rebound',    'Decrease',                                'Fast rebound fights weight transfer under braking',                     2),
      rec('TUNE',    'Brake Bias',      'Move forward slightly',                   'More front bias reduces rear instability under braking',                3),
      rec('TUNE',    'Diff Decel',      'Decrease',                                'High decel locking destabilises the rear under braking',                4),
    )
  }

  if (issue === 'performance') {
    recs.push(
      rec('UPGRADE', 'Brakes',          'Upgrade to Sport or Race brakes',         'Stock brakes are the limiting factor in stopping performance',          1),
      rec('TUNE',    'Tire Pressure',   'Lower slightly for more contact patch',   'More contact = more friction = shorter stopping distance',              2),
      rec('TUNE',    'Brake Bias',      'Fine-tune to 50/50 for shortest distance', 'Balanced bias uses all four tires for maximum deceleration',           3),
    )
  }

  return dedup(recs)
}

// ── DIFFERENTIAL ISSUES ────────────────────────────────────
function getDiffRecs({ issue }) {
  const recs = []

  if (issue === 'too_open') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Increase by 10–15%',                      'Open diff allows one wheel to spin freely — more lock distributes torque', 1),
      rec('TUNE',    'Tire Pressure',   'Lower slightly on driven axle',           'More contact patch helps even before diff changes',                     2),
      rec('UPGRADE', 'Sport/Race Diff', 'Install limited-slip differential',       'Stock open diff cannot be fixed by tuning alone above a threshold',     3),
    )
  }

  if (issue === 'too_locked') {
    recs.push(
      rec('TUNE',    'Diff Accel',      'Decrease by 10–15%',                      'Over-locked diff pushes the nose wide (understeer) on throttle application', 1),
      rec('TUNE',    'Diff Decel',      'Decrease',                                'High decel lock causes braking instability and nervous turn-in',         2),
    )
  }

  if (issue === 'snap_transition') {
    recs.push(
      rec('TUNE',    'Diff Decel',      'Decrease significantly (RWD: 15→5)',      'The most common cause of snap — decel lock releases suddenly mid-corner', 1),
      rec('TUNE',    'Rear Rebound',    'Decrease',                                'Fast rebound amplifies the diff-induced weight transfer oscillation',    2),
      rec('TUNE',    'Diff Accel',      'Reduce slightly',                         'Lower accel reduces the contrast between on/off throttle behaviour',     3),
    )
  }

  if (issue === 'awd_balance') {
    recs.push(
      rec('TUNE',    'AWD Center Bias', 'Adjust rear %: more rear = more rotation', 'FH6 confirmed: 60–70% rear. Below 50% = severe understeer always',        1),
      rec('TUNE',    'Front Diff Accel','Lower front accel (85→70)',               'High front lock fights steering and causes push on AWD builds',          2),
      rec('TUNE',    'Rear Diff Accel', 'Raise rear accel (55→65)',                'More rear locking helps rotation and reduces AWD push',                  3),
    )
  }

  return dedup(recs)
}

// ── Dedup + sort by priority ───────────────────────────────
function dedup(recs) {
  const seen = new Set()
  return recs
    .filter(r => {
      const key = `${r.type}-${r.param}`
      if (seen.has(key)) return false
      seen.add(key); return true
    })
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6)
}

// ── CATEGORY DEFINITIONS ───────────────────────────────────
export const DIAG_CATEGORIES = [
  {
    id: 'understeer',
    label: 'Understeer',
    icon: '↗',
    desc: "Doesn't turn enough — car plows straight",
    questions: [
      {
        id: 'when',
        text: 'When does it happen?',
        options: [
          { value: 'entry',  label: 'Corner Entry',  desc: 'While braking or just after' },
          { value: 'mid',    label: 'Mid Corner',    desc: 'Constant radius, steady throttle' },
          { value: 'exit',   label: 'Corner Exit',   desc: 'When applying throttle' },
          { value: 'all',    label: 'All phases',    desc: 'Throughout the whole corner' },
        ],
      },
      {
        id: 'speed',
        text: 'At what speed?',
        options: [
          { value: 'low',   label: 'Low Speed',  desc: 'Slow corners, hairpins' },
          { value: 'high',  label: 'High Speed', desc: 'Fast sweepers, highways' },
          { value: 'both',  label: 'Both',       desc: 'Everywhere' },
        ],
      },
      {
        id: 'severity',
        text: 'How severe?',
        options: [
          { value: 'mild',        label: 'Mild',        desc: 'Slight push, manageable' },
          { value: 'progressive', label: 'Progressive', desc: 'Gets worse as you commit more' },
          { value: 'extreme',     label: 'Extreme',     desc: 'Car refuses to turn at all' },
        ],
      },
    ],
    getRecs: getUndersteerRecs,
  },
  {
    id: 'oversteer',
    label: 'Oversteer',
    icon: '↙',
    desc: 'Rear slides out — car rotates too much',
    questions: [
      {
        id: 'when',
        text: 'When does it happen?',
        options: [
          { value: 'entry',   label: 'Corner Entry',  desc: 'On or after braking (trail braking)' },
          { value: 'mid',     label: 'Mid Corner',    desc: 'Constant throttle, constant radius' },
          { value: 'exit',    label: 'Corner Exit',   desc: 'On throttle application' },
          { value: 'liftoff', label: 'Lift-off',      desc: 'When you release the throttle' },
        ],
      },
      {
        id: 'type',
        text: 'What type?',
        options: [
          { value: 'progressive',   label: 'Progressive',        desc: 'Gradual, predictable slide' },
          { value: 'snap',          label: 'Snap',               desc: 'Sudden, hard to catch' },
          { value: 'tank_slapper',  label: 'Tank slapper',       desc: 'Oscillates left/right repeatedly' },
        ],
      },
    ],
    getRecs: getOversteerRecs,
  },
  {
    id: 'traction',
    label: 'Traction Loss',
    icon: '🔥',
    desc: 'Wheels spinning — losing drive',
    questions: [
      {
        id: 'where',
        text: 'Where does traction break?',
        options: [
          { value: 'launch',       label: 'Launch',        desc: 'Off the line from standstill' },
          { value: 'corner_exit',  label: 'Corner Exit',   desc: 'Accelerating out of corners' },
          { value: 'straight',     label: 'Straight Line', desc: 'Mid-gear in a straight' },
          { value: 'high_speed',   label: 'High Speed',    desc: 'Above 150+ km/h' },
        ],
      },
      {
        id: 'axle',
        text: 'Which wheels spin?',
        options: [
          { value: 'rear',  label: 'Rear wheels',  desc: 'RWD or AWD rear' },
          { value: 'front', label: 'Front wheels', desc: 'FWD or AWD front' },
          { value: 'all',   label: 'All wheels',   desc: 'AWD, everything spinning' },
        ],
      },
      {
        id: 'severity',
        text: 'How bad?',
        options: [
          { value: 'brief',          label: 'Brief spin',        desc: 'Recovers quickly' },
          { value: 'sustained',      label: 'Sustained',         desc: 'Keeps spinning for a while' },
          { value: 'uncontrollable', label: 'Uncontrollable',    desc: 'Cannot manage it at all' },
        ],
      },
    ],
    getRecs: getTractionRecs,
  },
  {
    id: 'braking',
    label: 'Braking Issues',
    icon: '🛑',
    desc: 'Locking up, instability or poor brake performance',
    questions: [
      {
        id: 'issue',
        text: 'What is the braking problem?',
        options: [
          { value: 'lockup',      label: 'Wheel Lockup',       desc: 'Wheels lock under braking' },
          { value: 'instability', label: 'Instability',        desc: 'Car dives, pulls or spins under braking' },
          { value: 'performance', label: 'Brake Performance',  desc: 'Too long stopping distance or fade' },
        ],
      },
      {
        id: 'axle',
        text: 'Which end?',
        options: [
          { value: 'front', label: 'Front', desc: 'Nose dives / front locks' },
          { value: 'rear',  label: 'Rear',  desc: 'Rear unstable / rear locks' },
          { value: 'both',  label: 'Both',  desc: 'General braking problem' },
        ],
      },
    ],
    getRecs: getBrakingRecs,
  },
  {
    id: 'differential',
    label: 'Differential',
    icon: '⚙',
    desc: 'Power delivery feels wrong — often misdiagnosed as suspension',
    questions: [
      {
        id: 'issue',
        text: 'What does it feel like?',
        options: [
          { value: 'too_open',       label: 'One wheel spinning',   desc: 'Inside wheel spins, outside has no drive' },
          { value: 'too_locked',     label: 'Pushes wide on gas',   desc: 'Car understeers when you apply throttle' },
          { value: 'snap_transition', label: 'Snap on/off throttle', desc: 'Car snaps when transitioning throttle' },
          { value: 'awd_balance',    label: 'AWD feels wrong',      desc: 'AWD car pushing or spinning unexpectedly' },
        ],
      },
    ],
    getRecs: getDiffRecs,
  },
]

// ── Main entry point ───────────────────────────────────────
export function getRecommendations(categoryId, answers) {
  const cat = DIAG_CATEGORIES.find(c => c.id === categoryId)
  if (!cat) return []
  return cat.getRecs(answers)
}

// ─────────────────────────────────────────────────────────
// ROUND 2 CATEGORIES
// ─────────────────────────────────────────────────────────

// ── SUSPENSION / CHASSIS ───────────────────────────────────
function getSuspensionRecs({ issue, when }) {
  const recs = []

  if (issue === 'bouncy') {
    if (when === 'kerb') {
      recs.push(
        rec('TUNE', 'Bump Damping',    'Increase front and/or rear',              'Bump controls initial compression speed — more bump absorbs kerb impact',  1),
        rec('TUNE', 'Rebound Damping', 'Decrease slightly',                       'If rebound is too fast it launches the car back up after kerb hit',       2),
        rec('TUNE', 'Spring Rate',     'Stiffen slightly',                        'Softer springs compress too much over kerbs, losing contact patch',        3),
      )
    }
    if (when === 'continuous') {
      recs.push(
        rec('TUNE', 'Rebound Damping', 'Decrease — this is almost always rebound','Excessive rebound fights the spring and causes oscillation',              1),
        rec('TUNE', 'Bump Damping',    'Check ratio: rebound = bump ÷ 0.4',       'Mismatched bump/rebound causes continuous porpoising',                    2),
        rec('TUNE', 'Spring Rate',     'Stiffen if springs are too soft',          'Very soft springs with fast rebound is the classic bounce combo',         3),
      )
    }
    if (when === 'bottoming') {
      recs.push(
        rec('TUNE', 'Spring Rate',     'Stiffen — car is compressing too far',    'Bottoming means spring is too soft for the car weight and speed',         1),
        rec('TUNE', 'Bump Damping',    'Increase to slow compression',            'Faster bump reduces peak compression depth',                             2),
        rec('TUNE', 'Ride Height',     'Raise if available',                      'More ride height gives more suspension travel before bottoming',          3),
      )
    }
  }

  if (issue === 'too_stiff') {
    recs.push(
      rec('TUNE', 'Spring Rate',     'Soften front and/or rear',                  'Stiff springs skip over bumps instead of absorbing them — loss of grip', 1),
      rec('TUNE', 'Bump Damping',    'Decrease — allow faster compression',       'High bump with stiff springs = zero compliance = no mechanical grip',    2),
      rec('TUNE', 'Tire Pressure',   'Lower slightly',                            'Less pressure acts as a secondary suspension compliance layer',           3),
    )
  }

  if (issue === 'weight_transfer') {
    if (when === 'too_slow') {
      recs.push(
        rec('TUNE', 'Spring Rate',     'Soften — allow more body roll',           'Stiff springs transfer weight too slowly, reducing tire loading speed',  1),
        rec('TUNE', 'ARB',             'Soften front and rear ARB',               'ARB stiffness directly controls roll speed — softer = faster transfer', 2),
        rec('TUNE', 'Bump Damping',    'Decrease front',                          'High front bump resists dive, slowing weight to front tires',            3),
      )
    }
    if (when === 'too_aggressive') {
      recs.push(
        rec('TUNE', 'Spring Rate',     'Stiffen to resist pitch/roll',            'More spring rate controls body motion speed under load changes',         1),
        rec('TUNE', 'ARB',             'Stiffen front and/or rear',               'ARBs directly resist body roll — primary tool for roll stiffness',       2),
        rec('TUNE', 'Rebound Damping', 'Increase — slow the return',              'Fast rebound after braking/cornering feels like aggressive weight snap', 3),
      )
    }
  }

  return dedup(recs)
}

// ── STEERING RESPONSE ──────────────────────────────────────
function getSteeringRecs({ issue }) {
  const recs = []

  if (issue === 'slow_turnin') {
    recs.push(
      rec('TUNE', 'Front Toe',       'Add toe-out (−0.1° to −0.3°)',              'Toe-out is the single biggest turn-in response tuning lever',            1),
      rec('TUNE', 'Caster',          'Set to 5.5–6.0° (FH6 confirmed — above 6.0° causes snap on turn-in)',          'FH6: 5.5–6.0° — too high (7°+) actually causes snap oversteer on turn-in',                2),
      rec('TUNE', 'Front ARB',       'Soften slightly',                           'Stiff front ARB delays weight transfer to outer front tire',             3),
      rec('TUNE', 'Front Rebound',   'Decrease — allow faster weight transfer',   'Slow rebound delays front tire loading on corner entry',                 4),
      rec('UPGRADE', 'Front Tires',  'Upgrade compound',                          'Better front grip = faster response, especially slow-speed corners',     5),
    )
  }

  if (issue === 'nervous') {
    recs.push(
      rec('TUNE', 'Front Toe',       'Reduce toe-out or add slight toe-in',       'Toe-out increases steering sensitivity — reduce for stability',          1),
      rec('TUNE', 'Caster',          'Verify at 7.0° — too low causes twitchiness','FH6: target 5.5–6.0°, not higher',         2),
      rec('TUNE', 'Front ARB',       'Stiffen slightly',                          'More ARB stiffness resists sudden lateral weight shifts',               3),
      rec('TUNE', 'Front Spring',    'Stiffen slightly',                          'More front spring resists rapid pitch changes that cause darting',       4),
    )
  }

  if (issue === 'self_centering') {
    recs.push(
      rec('TUNE', 'Caster',          'Target 5.5–6.0° in FH6',                      'Caster is the primary driver of self-centering force in FH6',           1),
      rec('TUNE', 'Front Toe',       'Add slight toe-in on rear to stabilise',    'Rear toe-in improves straight-line tracking and centering feel',         2),
      rec('TUNE', 'Tire Pressure',   'Check — overinflated tires reduce feedback', 'High pressure reduces contact patch and self-centering feel',           3),
    )
  }

  return dedup(recs)
}

// ── HIGH SPEED STABILITY ───────────────────────────────────
function getHighSpeedRecs({ when, symptom }) {
  const recs = []

  if (symptom === 'floaty' || symptom === 'wandering') {
    recs.push(
      rec('TUNE', 'Aero Rear',       'Increase rear downforce',                   'Floaty/wandering at speed = not enough rear downforce for the speed',    1),
      rec('TUNE', 'Aero Front',      'Balance front to match — target 0.40–0.45', 'FH6 aero balance target: 40–45% front. Too much front = understeer',    2),
      rec('TUNE', 'Rear Spring',     'Stiffen for high-speed platforms',          'Stiffer rear resists aerodynamic body rise at speed',                   3),
      rec('TUNE', 'Rear Toe',        'Add slight toe-in (0.1°–0.2°)',             'Rear toe-in improves high-speed straight-line tracking significantly',   4),
    )
  }

  if (symptom === 'hs_understeer') {
    recs.push(
      rec('TUNE', 'Aero Front',      'Increase front downforce',                  'High-speed understeer is almost always an aero balance issue',           1),
      rec('TUNE', 'Aero Balance',    'Target 0.40–0.45 front — check balance',   'FH6 target: 40–45% front. Max front / min rear meta is dead in FH6',    2),
      rec('TUNE', 'Front Spring',    'Stiffen — resists aero-induced understeer', 'Front spring stiffness affects how aero load is distributed',            3),
    )
  }

  if (symptom === 'rear_instability') {
    recs.push(
      rec('TUNE', 'Aero Rear',       'Increase rear downforce significantly',     'Rear instability at speed = rear losing grip due to insufficient aero', 1),
      rec('TUNE', 'Rear Rebound',    'Decrease',                                  'Fast rebound amplifies aero-induced instability at speed',              2),
      rec('TUNE', 'Rear Toe',        'Add toe-in',                                'Toe-in stabilises rear directional stability at high speed',             3),
      rec('TUNE', 'Diff Accel',      'Reduce slightly',                           'High accel lock at speed increases rear instability risk',               4),
    )
  }

  if (when === 'braking') {
    recs.push(
      rec('TUNE', 'Brake Bias',      'Move forward slightly',                     'High-speed brake instability often means rear is braking too hard',      1),
      rec('TUNE', 'Rear Bump',       'Increase',                                  'More rear bump resists dive and weight shift under hard braking',        2),
      rec('TUNE', 'Aero Rear',       'Increase',                                  'More rear aero load = more rear stability under braking',               3),
    )
  }

  return dedup(recs)
}

// ── GEARING / POWER DELIVERY ───────────────────────────────
function getGearingRecs({ issue }) {
  const recs = []

  if (issue === 'too_short') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Lower (e.g. 3.85 → 3.50)',                  'Shorter final drive = more acceleration but hits limiter too soon',      1),
      rec('TUNE', 'Individual Gears','Lengthen top 1–2 gears',                    'Stretching final gears gives more top speed without losing acceleration', 2),
    )
  }

  if (issue === 'too_long') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Raise (e.g. 3.50 → 3.85)',                  'Longer final drive = less torque per gear, better top speed',            1),
      rec('TUNE', 'Individual Gears','Shorten lower gears',                       'Shortening 1–3 improves launch and low-speed acceleration',              2),
    )
  }

  if (issue === 'top_speed') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Lower the ratio',                           'Final drive directly sets the top speed ceiling',                        1),
      rec('TUNE', 'Top Gear',        'Lengthen top gear',                         'Longer top gear = higher terminal velocity in that gear',                2),
      rec('TUNE', 'Aero',            'Reduce total downforce',                    'Less aero drag = higher top speed, at the cost of cornering stability',  3),
      rec('UPGRADE', 'Engine',       'Check power upgrades — may need more hp',   'If top speed is limited by power, gearing alone cannot fix it',          4),
    )
  }

  if (issue === 'launch') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Raise ratio for better 1st gear torque',    'More final drive = more torque multiplication at launch',                1),
      rec('TUNE', 'Diff Accel',      'Increase on driven axle',                   'More accel locking distributes torque evenly at launch',                 2),
      rec('TUNE', 'Gear 1',          'Shorten 1st gear',                          'Short 1st puts you in powerband immediately off the line',               3),
      rec('UPGRADE', 'Tires',        'Drag compound — 1.4 bar',                   'Drag tires dramatically improve launch grip',                            4),
    )
  }

  if (issue === 'mid_range') {
    recs.push(
      rec('TUNE', 'Individual Gears','Tighten ratio spread in mid gears',         'Closer gear ratios keep revs in powerband between shifts',               1),
      rec('UPGRADE', 'Forced Induction', 'Check turbo/supercharger upgrade',      'Mid-range weakness often means torque curve peaks too high or too low',  2),
      rec('TUNE', 'Final Drive',     'Adjust to better suit powerband',           'Final drive shifts the entire power delivery range up or down',          3),
    )
  }

  return dedup(recs)
}

// ── THROTTLE RESPONSE ──────────────────────────────────────
function getThrottleRecs({ issue }) {
  const recs = []

  if (issue === 'too_aggressive') {
    recs.push(
      rec('TUNE', 'Diff Accel',      'Decrease — reduces torque spike at tip-in', 'High diff accel amplifies aggressive throttle into wheel spin',          1),
      rec('TUNE', 'Final Drive',     'Lengthen slightly',                         'Less torque multiplication = less aggressive initial response',           2),
      rec('TUNE', 'Gear 1',          'Lengthen 1st gear',                         'Longer 1st reduces the peak torque available at tip-in',                 3),
    )
  }

  if (issue === 'too_dull') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Shorten — more torque multiplication',      'Shorter final drive sharpens throttle response across all gears',        1),
      rec('TUNE', 'Diff Accel',      'Increase slightly',                         'More accel locking transfers power faster to the wheels',                2),
      rec('UPGRADE', 'Engine',       'Check power upgrades for torque',           'Dull throttle can mean low torque in the mid-range',                     3),
    )
  }

  if (issue === 'turbo_lag') {
    recs.push(
      rec('TUNE', 'Final Drive',     'Shorten to stay in boost RPM range',        'Keep revs in boost range to minimise felt lag',                          1),
      rec('TUNE', 'Gear Ratios',     'Tighten spread to avoid dropping out of boost', 'Wider gaps cause more pronounced lag between shifts',               2),
      rec('UPGRADE', 'Forced Induction', 'Consider turbo upgrade tier',           'Higher-tier turbos generally have faster spool and less lag',            3),
    )
  }

  if (issue === 'hard_to_dose') {
    recs.push(
      rec('TUNE', 'Diff Accel',      'Decrease — more progressive power delivery','Over-locked diff makes small throttle inputs hard to modulate',          1),
      rec('TUNE', 'Final Drive',     'Lengthen to spread the power range',        'Longer final drive gives more throttle travel before wheelspin',         2),
      rec('TUNE', 'Rear ARB',        'Soften — more chassis compliance on throttle','Stiff rear ARB makes tiny throttle inputs feel snappy',               3),
    )
  }

  return dedup(recs)
}

// ── AERO BALANCE ───────────────────────────────────────────
function getAeroRecs({ when, symptom }) {
  const recs = []

  if (symptom === 'hs_understeer') {
    recs.push(
      rec('TUNE', 'Aero Front',      'Increase front downforce',                  'High-speed understeer = front losing grip faster than rear at speed',    1),
      rec('TUNE', 'Aero Balance',    'Target 0.40–0.45 — NOTE: FH6 max-front meta is GONE', 'FH5 max front / min rear no longer works in FH6',             2),
      rec('TUNE', 'Rear',            'Reduce rear if already at max',             'Reducing rear shifts balance forward, improving high-speed rotation',    3),
    )
  }

  if (symptom === 'rear_instability') {
    recs.push(
      rec('TUNE', 'Aero Rear',       'Increase rear downforce',                   'Rear instability at speed = not enough rear aero load',                 1),
      rec('TUNE', 'Aero Balance',    'Move balance rearward — above 0.45',        'If 0.45 balance still unstable, the car may need more total downforce',  2),
      rec('TUNE', 'Rear Spring',     'Stiffen slightly',                          'Stiffer rear resists aero-induced body rise that reduces rear grip',     3),
    )
  }

  if (symptom === 'aero_stall') {
    recs.push(
      rec('TUNE', 'Aero Rear',       'Reduce angle slightly — stall from too steep', 'Wing stall occurs when angle of attack exceeds the airfoil limit',   1),
      rec('TUNE', 'Rear Spring',     'Stiffen — reduce rear squat under aero load', 'Body squat changes effective wing angle dynamically',                  2),
      rec('UPGRADE', 'Aero Kit',     'Check aero package tier',                   'Higher-tier aero components have better stall resistance',              3),
    )
  }

  if (when === 'fast_corner') {
    recs.push(
      rec('TUNE', 'Aero Balance',    'Fine-tune to 0.40–0.45 front',              'FH6 target for all builds — balance is more important than total load', 1),
      rec('TUNE', 'Aero Front',      'Increase if understeering in fast corners', 'Fast corner understeer = front needs more downforce',                   2),
      rec('TUNE', 'Aero Rear',       'Increase if rear unstable in fast corners', 'Fast corner oversteer = rear needs more downforce',                     3),
    )
  }

  return dedup(recs)
}

// ── SURFACE / BUMP SENSITIVITY ─────────────────────────────
function getSurfaceRecs({ issue }) {
  const recs = []

  if (issue === 'kerb_sensitivity') {
    recs.push(
      rec('TUNE', 'Bump Damping',    'Increase — slows compression over kerbs',   'More bump damping absorbs sharp kerb impacts without bottoming',         1),
      rec('TUNE', 'Spring Rate',     'Stiffen slightly',                           'Slightly stiffer spring controls how far the car dips into the kerb',   2),
      rec('TUNE', 'Rebound Damping', 'Decrease — faster return after kerb',       'If car is launched by kerbs, rebound is too fast — reduce it',          3),
      rec('TUNE', 'Tire Pressure',   'Lower slightly',                             'Lower pressure = more sidewall flex = more natural kerb absorption',    4),
    )
  }

  if (issue === 'road_camber') {
    recs.push(
      rec('TUNE', 'Rear Toe',        'Add toe-in (0.1°–0.2°)',                    'Rear toe-in resists camber-induced direction changes',                   1),
      rec('TUNE', 'Front ARB',       'Stiffen slightly',                          'More front ARB resists lateral weight transfer from road camber',        2),
      rec('TUNE', 'Front Spring',    'Stiffen — resists camber-induced dive',     'Softer springs are more sensitive to road camber changes',              3),
    )
  }

  if (issue === 'bumpy_corner') {
    recs.push(
      rec('TUNE', 'Bump Damping',    'Decrease — allow faster compliance',        'On bumpy corners, too much bump damping = tire skipping over surface',  1),
      rec('TUNE', 'Spring Rate',     'Soften slightly',                            'Softer springs allow the wheel to follow the bumpy surface better',     2),
      rec('TUNE', 'Rebound Damping', 'Decrease to match: rebound = bump ÷ 0.4',  'Matched bump/rebound gives consistent compliance over rough surfaces',   3),
      rec('TUNE', 'Tire Pressure',   'Lower — more contact patch compliance',     'Slightly lower pressure helps on bumpy surfaces',                       4),
    )
  }

  if (issue === 'bottoming') {
    recs.push(
      rec('TUNE', 'Spring Rate',     'Stiffen — car is compressing too far',      'Bottoming means spring rate is too low for the car mass and speed',     1),
      rec('TUNE', 'Bump Damping',    'Increase to slow compression peak',         'More bump damping limits peak compression depth over large bumps',      2),
      rec('TUNE', 'Ride Height',     'Raise if available',                        'More ride height = more travel before bottoming',                       3),
    )
  }

  return dedup(recs)
}

// ── APPEND ROUND 2 TO CATEGORIES ──────────────────────────
DIAG_CATEGORIES.push(
  {
    id: 'suspension',
    label: 'Suspension',
    icon: '〰',
    desc: 'Bouncy, too stiff, or wrong weight transfer',
    questions: [
      {
        id: 'issue',
        text: 'What is the suspension problem?',
        options: [
          { value: 'bouncy',          label: 'Bouncy / Pogo',        desc: 'Car bounces or oscillates' },
          { value: 'too_stiff',       label: 'Too Stiff',            desc: 'No grip on bumps, skipping' },
          { value: 'weight_transfer', label: 'Weight Transfer',      desc: 'Wrong pitch/roll behaviour' },
        ],
      },
      {
        id: 'when',
        text: 'When does it happen?',
        options: [
          { value: 'kerb',        label: 'Over kerbs',       desc: 'Launched or destabilised by kerbs' },
          { value: 'continuous',  label: 'Continuous',       desc: 'Ongoing bounce/oscillation' },
          { value: 'bottoming',   label: 'Bottoming out',    desc: 'Suspension hits the stops' },
          { value: 'too_slow',    label: 'Too slow transfer',desc: 'Late weight shift to tires' },
          { value: 'too_aggressive', label: 'Too aggressive',desc: 'Violent weight snap' },
        ],
      },
    ],
    getRecs: getSuspensionRecs,
  },
  {
    id: 'steering',
    label: 'Steering',
    icon: '◎',
    desc: 'Slow, nervous or poor self-centering',
    questions: [
      {
        id: 'issue',
        text: 'What feels wrong with the steering?',
        options: [
          { value: 'slow_turnin',    label: 'Slow Turn-In',      desc: 'Late or dead steering response' },
          { value: 'nervous',        label: 'Nervous / Twitchy', desc: 'Too sensitive, especially at speed' },
          { value: 'self_centering', label: 'Poor Self-Centering', desc: 'Doesn\'t want to straighten up' },
        ],
      },
    ],
    getRecs: getSteeringRecs,
  },
  {
    id: 'high_speed',
    label: 'High Speed',
    icon: '⚡',
    desc: 'Unstable, floaty or drifting at high speed',
    questions: [
      {
        id: 'when',
        text: 'When does it happen?',
        options: [
          { value: 'straight',     label: 'Straight Line',    desc: 'Wandering or floating' },
          { value: 'fast_corner',  label: 'Fast Corner',      desc: 'Sweepers or banked turns' },
          { value: 'braking',      label: 'Braking Zone',     desc: 'Unstable under hard braking' },
        ],
      },
      {
        id: 'symptom',
        text: 'What does it feel like?',
        options: [
          { value: 'floaty',          label: 'Floaty / Light',    desc: 'Car feels like it\'s flying' },
          { value: 'wandering',       label: 'Wandering',         desc: 'Hard to hold a line' },
          { value: 'hs_understeer',   label: 'High-Speed Understeer', desc: 'Pushes wide in fast corners' },
          { value: 'rear_instability',label: 'Rear Instability',  desc: 'Rear steps out at speed' },
          { value: 'aero_stall',      label: 'Aero Stall',        desc: 'Sudden grip loss feeling' },
        ],
      },
    ],
    getRecs: getHighSpeedRecs,
  },
  {
    id: 'gearing',
    label: 'Gearing',
    icon: '⚙',
    desc: 'Wrong ratios, limited top speed or poor acceleration',
    questions: [
      {
        id: 'issue',
        text: 'What is the gearing problem?',
        options: [
          { value: 'too_short',  label: 'Too Short',          desc: 'Hits rev limiter too often' },
          { value: 'too_long',   label: 'Too Long',           desc: 'Slow acceleration, sluggish' },
          { value: 'top_speed',  label: 'Limited Top Speed',  desc: 'Runs out of gear at high speed' },
          { value: 'launch',     label: 'Poor Launch',        desc: '1st/2nd unusable, wheelspin or no drive' },
          { value: 'mid_range',  label: 'Weak Mid-Range',     desc: 'Power gap between shifts' },
        ],
      },
    ],
    getRecs: getGearingRecs,
  },
  {
    id: 'throttle',
    label: 'Throttle',
    icon: '▶',
    desc: 'Too aggressive, dull or hard to modulate',
    questions: [
      {
        id: 'issue',
        text: 'What does the throttle feel like?',
        options: [
          { value: 'too_aggressive', label: 'Too Aggressive',   desc: 'Snaps or spins on tip-in' },
          { value: 'too_dull',       label: 'Too Dull',         desc: 'Unresponsive, slow to react' },
          { value: 'turbo_lag',      label: 'Turbo Lag',        desc: 'Boost arrives suddenly, not smoothly' },
          { value: 'hard_to_dose',   label: 'Hard to Modulate', desc: 'Difficult to apply precise amounts' },
        ],
      },
    ],
    getRecs: getThrottleRecs,
  },
  {
    id: 'aero',
    label: 'Aero Balance',
    icon: '◈',
    desc: 'Aero-related issues at speed or in fast corners',
    questions: [
      {
        id: 'when',
        text: 'When does it occur?',
        options: [
          { value: 'high_speed',   label: 'High Speed Only',   desc: 'Only above ~150 km/h' },
          { value: 'fast_corner',  label: 'Fast Corners',      desc: 'Sweepers or banked turns' },
          { value: 'braking',      label: 'Braking Zone',      desc: 'Under heavy braking' },
        ],
      },
      {
        id: 'symptom',
        text: 'What is the symptom?',
        options: [
          { value: 'hs_understeer',    label: 'High-Speed Understeer', desc: 'Pushes wide at speed' },
          { value: 'rear_instability', label: 'Rear Instability',      desc: 'Rear loose at speed' },
          { value: 'aero_stall',       label: 'Aero Stall',            desc: 'Sudden downforce loss' },
        ],
      },
    ],
    getRecs: getAeroRecs,
  },
  {
    id: 'surface',
    label: 'Surface Sensitivity',
    icon: '≈',
    desc: 'Kerbs, road camber or bumpy corners upsetting the car',
    questions: [
      {
        id: 'issue',
        text: 'What surface issue are you experiencing?',
        options: [
          { value: 'kerb_sensitivity', label: 'Kerb Sensitivity',    desc: 'Launched or destabilised over kerbs' },
          { value: 'road_camber',      label: 'Road Camber',         desc: 'Car pulls or wanders on cambered road' },
          { value: 'bumpy_corner',     label: 'Bumpy Corner',        desc: 'Loses grip on rough corner surface' },
          { value: 'bottoming',        label: 'Bottoming Out',       desc: 'Suspension hits the stops' },
        ],
      },
    ],
    getRecs: getSurfaceRecs,
  },
)

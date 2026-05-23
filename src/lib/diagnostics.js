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
      rec('TUNE',    'Rear Bump',       'Decrease to match rebound ratio',         'Check bump/rebound ratio: rebound = bump ÷ 0.4',                         0),
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
      rec('TUNE',    'Diff Accel',      'RWD: decrease to 45–50% | AWD: rebalance', 'Too much lock spins the inside rear on corner exit',                  1),
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
      rec('TUNE',    'AWD Center Bias', 'Adjust rear %: more rear = more rotation', 'FH6 target: 70–80% rear. Below 50% = severe understeer always',        1),
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

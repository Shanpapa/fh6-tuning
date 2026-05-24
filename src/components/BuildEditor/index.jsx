import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { GOALS, GOAL_INFO, GOAL_COLORS, classFromPi } from '../../lib/constants.js'
import { Btn, Row, Modal, ClassBadge, SectionHead, Spinner, HR } from '../UI/index.jsx'
import UpgradesTab from './UpgradesTab.jsx'
import TuneTab from './TuneTab.jsx'
import NotesTab from './NotesTab.jsx'
import { useIsMobile } from '../../lib/useIsMobile.js'

// ── Goal badge ─────────────────────────────────────────────
function GoalBadge({ goal }) {
  const color = GOAL_COLORS[goal] ?? t.dim
  const label = GOAL_INFO[goal]?.short ?? goal
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 3, padding: '2px 8px', fontSize: 11, fontFamily: t.mono,
      color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  )
}

// ── New build modal ────────────────────────────────────────
function NewBuildModal({ userCarId, onClose, onCreated }) {
  const [name,    setName]    = useState('')
  const [goal,    setGoal]    = useState('race')
  const [pi,      setPi]      = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const derivedClass = classFromPi(pi)

  const create = async () => {
    if (!name.trim()) { setErr('Build name required'); return }
    if (pi && !derivedClass) { setErr('PI must be between 100 and 999'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.from('builds').insert({
      user_car_id:  userCarId,
      name:         name.trim(),
      goal,
      target_class: derivedClass ?? null,
      target_pi:    pi ? parseInt(pi) : null,
      installed_parts: [],
    })
    if (error) { setErr(error.message); setLoading(false); return }
    onCreated()
  }

  return (
    <Modal title="New Build" onClose={onClose}>
      <Row label="Build name">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Track S2, Drift setup…"
          autoFocus onKeyDown={e => e.key === 'Enter' && create()}
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        />
      </Row>
      <Row label="Goal">
        <select
          value={goal} onChange={e => setGoal(e.target.value)}
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        >
          {GOALS.map(g => (
            <option key={g} value={g}>{GOAL_INFO[g]?.label ?? g}</option>
          ))}
        </select>
      </Row>
      <Row label="Target PI">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="number" value={pi} onChange={e => setPi(e.target.value)}
            placeholder="e.g. 900" min={100} max={999}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
              padding: '7px 10px', borderRadius: 4, fontSize: 14,
              fontFamily: t.mono, width: '100%', outline: 'none',
            }}
          />
          {derivedClass && <div style={{ flexShrink: 0 }}><ClassBadge cls={derivedClass} /></div>}
          {pi && !derivedClass && (
            <span style={{ color: t.red, fontSize: 11, fontFamily: t.mono, flexShrink: 0 }}>
              Invalid
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, marginTop: 4 }}>
          Class derived automatically from PI
        </div>
      </Row>
      {err && <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 10 }}>{err}</div>}
      <HR />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={create} disabled={loading}>{loading ? '…' : 'Create Build'}</Btn>
      </div>
    </Modal>
  )
}


// ── Edit build modal ───────────────────────────────────────
function EditBuildModal({ build, onClose, onSaved }) {
  const [name, setName] = useState(build.name || '')
  const [goal, setGoal] = useState(build.goal || 'race')
  const [pi,   setPi]   = useState(build.target_pi ? String(build.target_pi) : '')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const derivedClass = classFromPi(pi)

  const save = async () => {
    if (!name.trim()) { setErr('Build name required'); return }
    if (pi && !derivedClass) { setErr('PI must be between 100 and 999'); return }
    setLoading(true)
    await supabase.from('builds').update({
      name: name.trim(), goal,
      target_class: derivedClass ?? null,
      target_pi: pi ? parseInt(pi) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', build.id)
    onSaved()
  }

  return (
    <Modal title="Edit Build" onClose={onClose}>
      <Row label="Build name">
        <input
          value={name} onChange={e => setName(e.target.value)}
          autoFocus onKeyDown={e => e.key === 'Enter' && save()}
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        />
      </Row>
      <Row label="Goal">
        <select value={goal} onChange={e => setGoal(e.target.value)}
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        >
          {GOALS.map(g => <option key={g} value={g}>{GOAL_INFO[g]?.label ?? g}</option>)}
        </select>
      </Row>
      <Row label="Target PI">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="number" value={pi} onChange={e => setPi(e.target.value)}
            placeholder="e.g. 900" min={100} max={999}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
              padding: '7px 10px', borderRadius: 4, fontSize: 14,
              fontFamily: t.mono, width: '100%', outline: 'none',
            }}
          />
          {derivedClass && <div style={{ flexShrink: 0 }}><ClassBadge cls={derivedClass} /></div>}
        </div>
        <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, marginTop: 4 }}>Class derived automatically from PI</div>
      </Row>
      {err && <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 10 }}>{err}</div>}
      <HR />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={loading}>{loading ? '…' : 'Save'}</Btn>
      </div>
    </Modal>
  )
}

// ── Build card ─────────────────────────────────────────────
function BuildCard({ build, onClick, onDelete, onEdit }) {
  const [hover, setHover] = useState(false)
  const updated = new Date(build.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t.surf, border: `1px solid ${hover ? t.accent : t.border}`,
        borderRadius: 6, padding: '14px 16px', cursor: 'pointer',
        transition: 'border-color 0.15s', position: 'relative',
      }}
    >
      <div style={{
        fontFamily: t.head, fontSize: 20, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.04em',
        color: t.text, marginBottom: 10, paddingRight: 28,
      }}>
        {build.name}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {build.goal && <GoalBadge goal={build.goal} />}
        {(() => {
          const displayPi  = build.current_pi ?? build.target_pi
          const displayCls = displayPi ? classFromPi(displayPi) : build.target_class
          return displayCls
            ? <ClassBadge cls={displayCls} pi={displayPi} />
            : null
        })()}
        {build.target_pi && build.current_pi && build.current_pi !== build.target_pi && (
          <span style={{ fontSize: 10, fontFamily: t.mono, color: t.dim, alignSelf: 'center' }}>
            target {build.target_pi}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}>Updated {updated}</div>
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); onEdit() }}
          style={{ background: 'none', border: 'none', color: t.dim, fontSize: 13, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
          title="Edit build"
        >✎</button>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ background: 'none', border: 'none', color: t.dim, fontSize: 14, cursor: 'pointer', padding: '2px 6px', lineHeight: 1 }}
          title="Delete build"
        >✕</button>
      </div>
    </div>
  )
}

// ── Builds list ────────────────────────────────────────────
function BuildsList({ userCar, onBack, onSelectBuild }) {
  const car = userCar?.car
  const [builds,     setBuilds]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showNew,    setShowNew]    = useState(false)
  const [editBuild,  setEditBuild]  = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const isMobile = useIsMobile()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('builds').select('*')
      .eq('user_car_id', userCar.id)
      .order('updated_at', { ascending: false })
    setBuilds(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [userCar.id])

  const deleteBuild = (build) => setDelConfirm(build)
  const confirmDelete = async () => {
    await supabase.from('builds').delete().eq('id', delConfirm.id)
    setDelConfirm(null); load()
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.mid, fontFamily: t.mono,
          fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >← Garage</button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: t.mid, fontFamily: t.mono }}>{car?.year}</div>
        <div style={{
          fontFamily: t.head, fontSize: 28, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.04em', color: t.text, lineHeight: 1.1,
        }}>
          {car?.make} {car?.model}
        </div>
        {userCar.nickname && (
          <div style={{ fontSize: 12, color: t.accent, fontFamily: t.mono, marginTop: 4 }}>
            {userCar.nickname}
          </div>
        )}
      </div>

      <SectionHead action={<Btn onClick={() => setShowNew(true)}>+ New Build</Btn>}>
        Builds
      </SectionHead>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
      ) : builds.length === 0 ? (
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 48, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
        }}>
          No builds yet — create your first one
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12,
        }}>
          {builds.map(b => (
            <BuildCard key={b.id} build={b}
              onClick={() => onSelectBuild(b)}
              onDelete={() => deleteBuild(b)}
              onEdit={() => setEditBuild(b)} />
          ))}
        </div>
      )}

      {showNew && (
        <NewBuildModal
          userCarId={userCar.id}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load() }}
        />
      )}
      {editBuild && (
        <EditBuildModal
          build={editBuild}
          onClose={() => setEditBuild(null)}
          onSaved={() => { setEditBuild(null); load() }}
        />
      )}
      {delConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: t.surf, border: `1px solid ${t.borderHi}`,
            borderRadius: 8, padding: 28, width: 340,
          }}>
            <div style={{ fontFamily: t.head, fontSize: 18, fontWeight: 800, textTransform: 'uppercase', color: t.text, marginBottom: 10 }}>
              Delete build?
            </div>
            <div style={{ fontSize: 13, fontFamily: t.mono, color: t.mid, marginBottom: 24, lineHeight: 1.6 }}>
              "{delConfirm.name}" will be permanently deleted.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setDelConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={confirmDelete}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Build edit ─────────────────────────────────────────────
function BuildEdit({ build, userCar, onBack, onTabChange }) {
  const car = userCar?.car
  const [tab,            setTab]           = useState('upgrades')
  const [installedParts, setInstalledParts] = useState([])
  const [currentPi,      setCurrentPi]     = useState(build.current_pi ?? build.target_pi ?? car?.stock_pi ?? null)

  // Load installed parts on mount
  useEffect(() => {
    const ids = Array.isArray(build.installed_parts) ? build.installed_parts : []
    if (!ids.length) return
    supabase.from('car_parts').select('*').in('id', ids)
      .then(({ data }) => setInstalledParts(data || []))
  }, [build.id])

  const TABS = [
    { id: 'upgrades', label: 'Upgrades' },
    { id: 'tune',     label: 'Tune'     },
    { id: 'notes',    label: 'Notes'    },
  ]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.mid, fontFamily: t.mono,
          fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >← {car?.make} {car?.model}</button>

      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: t.head, fontSize: 24, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8,
        }}>
          {build.name}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {build.goal && <GoalBadge goal={build.goal} />}
          {(() => {
            const displayPi  = currentPi
            const displayCls = displayPi ? classFromPi(displayPi) : build.target_class
            return displayCls ? <ClassBadge cls={displayCls} pi={displayPi} /> : null
          })()}
          {build.target_pi && currentPi && currentPi !== build.target_pi && (
            <span style={{ fontSize: 10, fontFamily: t.mono, color: t.dim }}>
              target {build.target_pi}
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 2, borderBottom: `1px solid ${t.border}`, marginBottom: 20,
      }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id} onClick={() => { setTab(id); onTabChange?.(id) }}
            style={{
              background: 'none', border: 'none', padding: '8px 16px',
              fontFamily: t.mono, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
              color: tab === id ? t.accent : t.dim,
              borderBottom: tab === id ? `2px solid ${t.accent}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'notes' && (
        <NotesTab build={build} />
      )}
      {tab === 'upgrades' && (
        <UpgradesTab
          build={build} car={car}
          onPartsChange={setInstalledParts}
          onPiChange={setCurrentPi}
        />
      )}
      {tab === 'tune' && (
        <TuneTab
          build={build} car={car}
          installedParts={installedParts}
        />
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────
export default function BuildEditor({ userCar, onBack, onTabChange }) {
  const [selectedBuild, setSelectedBuild] = useState(null)

  if (selectedBuild) return (
    <BuildEdit build={selectedBuild} userCar={userCar} onBack={() => { setSelectedBuild(null); onTabChange?.(null) }} onTabChange={onTabChange} />
  )

  return (
    <BuildsList userCar={userCar} onBack={onBack} onSelectBuild={setSelectedBuild} />
  )
}

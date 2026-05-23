import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { GOALS, classFromPi } from '../../lib/constants.js'
import { Btn, Row, Modal, ClassBadge, SectionHead, Spinner, HR } from '../UI/index.jsx'

// ── Goal badge ─────────────────────────────────────────────
const GOAL_COLORS = {
  race: '#38bdf8', drift: '#f97316', drag: '#a78bfa',
  rally: '#4ade80', hillclimb: '#fbbf24', offroad: '#f87171',
}

function GoalBadge({ goal }) {
  const color = GOAL_COLORS[goal] ?? t.dim
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 3, padding: '2px 8px', fontSize: 11, fontFamily: t.mono,
      color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {goal}
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
            <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
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

// ── Build card ─────────────────────────────────────────────
function BuildCard({ build, onClick, onDelete }) {
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
        {build.goal         && <GoalBadge goal={build.goal} />}
        {build.target_class && <ClassBadge cls={build.target_class} pi={build.target_pi} />}
      </div>
      <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono }}>Updated {updated}</div>
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
          color: t.dim, fontSize: 14, cursor: 'pointer', padding: '2px 6px', lineHeight: 1,
        }}
        title="Delete build"
      >✕</button>
    </div>
  )
}

// ── Builds list ────────────────────────────────────────────
function BuildsList({ userCar, onBack, onSelectBuild }) {
  const car = userCar?.car
  const [builds,  setBuilds]  = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

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

  const deleteBuild = async (id) => {
    if (!confirm('Delete this build?')) return
    await supabase.from('builds').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.dim, fontFamily: t.mono,
          fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >← Garage</button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}>{car?.year}</div>
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
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12,
        }}>
          {builds.map(b => (
            <BuildCard key={b.id} build={b}
              onClick={() => onSelectBuild(b)} onDelete={() => deleteBuild(b.id)} />
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
    </div>
  )
}

// ── Build edit (placeholder) ───────────────────────────────
function BuildEdit({ build, userCar, onBack }) {
  const car = userCar?.car
  return (
    <div style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.dim, fontFamily: t.mono,
          fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >← {car?.make} {car?.model}</button>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontFamily: t.head, fontSize: 26, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8,
        }}>
          {build.name}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {build.goal         && <GoalBadge goal={build.goal} />}
          {build.target_class && <ClassBadge cls={build.target_class} pi={build.target_pi} />}
        </div>
      </div>
      <div style={{
        background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
        padding: 32, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
      }}>
        Upgrades → Baseline Tune → Diagnostic — coming next
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────
export default function BuildEditor({ userCar, onBack }) {
  const [selectedBuild, setSelectedBuild] = useState(null)

  if (selectedBuild) return (
    <BuildEdit build={selectedBuild} userCar={userCar} onBack={() => setSelectedBuild(null)} />
  )

  return (
    <BuildsList userCar={userCar} onBack={onBack} onSelectBuild={setSelectedBuild} />
  )
}

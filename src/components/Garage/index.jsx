import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import {
  Btn, Row, HR, Modal, Autocomplete,
  ClassBadge, DtBadge, SectionHead, Spinner,
} from '../UI/index.jsx'
import { useIsMobile } from '../../lib/useIsMobile.js'

// ── Edit nickname modal ────────────────────────────────────
function EditNicknameModal({ userCar, onClose, onSaved }) {
  const [nickname, setNickname] = useState(userCar.nickname || '')
  const [saving,   setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('user_cars')
      .update({ nickname: nickname.trim() || null })
      .eq('id', userCar.id)
    onSaved()
  }

  return (
    <Modal title="Edit Nickname" onClose={onClose}>
      <Row label="Nickname">
        <input
          value={nickname} onChange={e => setNickname(e.target.value)}
          placeholder="e.g. Track build, Drift spec…"
          autoFocus onKeyDown={e => e.key === 'Enter' && save()}
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        />
      </Row>
      <HR />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={saving}>{saving ? '…' : 'Save'}</Btn>
      </div>
    </Modal>
  )
}

// ── Car card ──────────────────────────────────────────────
function GarageCard({ userCar, car, onClick, onRemove, onEditNickname }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t.surf, border: `1px solid ${hover ? t.accent : t.border}`,
        borderRadius: 6, padding: 14, cursor: 'pointer', transition: 'border-color 0.15s',
        position: 'relative',
      }}
    >
      <div style={{ marginBottom: 6, paddingRight: 48 }}>
        <div style={{ fontSize: 13, color: t.mid, fontFamily: t.mono }}>{car.year}</div>
        <div style={{
          fontFamily: t.head, fontSize: 22, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.04em', color: t.text, lineHeight: 1.1,
        }}>
          {car.make} {car.model}
        </div>
        <div
          onClick={e => { e.stopPropagation(); onEditNickname() }}
          style={{
            fontSize: 12, color: userCar.nickname ? t.accent : t.dim,
            fontFamily: t.mono, marginTop: 3, cursor: 'pointer',
            borderBottom: `1px dashed ${userCar.nickname ? t.accent + '55' : t.border}`,
            display: 'inline-block',
          }}
          title="Edit nickname"
        >
          {userCar.nickname || '+ add nickname'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {car.stock_class    && <ClassBadge cls={car.stock_class} pi={car.stock_pi} />}
        {car.stock_drivetrain && <DtBadge dt={car.stock_drivetrain} />}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'none', border: 'none', color: t.dim,
          fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
        }}
        title="Remove from garage"
      >✕</button>
    </div>
  )
}

// ── Add car modal ─────────────────────────────────────────
function AddCarModal({ userId, onClose, onAdded }) {
  const [makes,    setMakes]    = useState([])
  const [models,   setModels]   = useState([])
  const [cars,     setCars]     = useState([])
  const [make,     setMake]     = useState('')
  const [model,    setModel]    = useState('')
  const [year,     setYear]     = useState('')
  const [nickname, setNickname] = useState('')
  const [matched,  setMatched]  = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')

  useEffect(() => {
    supabase.from('cars').select('make').eq('verified', true)
      .then(({ data }) => {
        setMakes([...new Set((data || []).map(r => r.make))].sort())
      })
  }, [])

  useEffect(() => {
    if (!make) { setModels([]); setModel(''); return }
    supabase.from('cars').select('model').eq('make', make).eq('verified', true)
      .then(({ data }) => {
        setModels([...new Set((data || []).map(r => r.model))].sort())
      })
  }, [make])

  useEffect(() => {
    if (!make || !model) { setCars([]); setYear(''); setMatched(null); return }
    supabase.from('cars').select('*')
      .eq('make', make).eq('model', model).eq('verified', true)
      .order('year')
      .then(({ data }) => setCars(data || []))
  }, [make, model])

  useEffect(() => {
    if (!year) { setMatched(null); return }
    setMatched(cars.find(c => String(c.year) === String(year)) || null)
  }, [year, cars])

  const add = async () => {
    if (!matched) { setErr('Select a car from the catalog'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.from('user_cars').insert({
      user_id: userId, car_id: matched.id, nickname: nickname || null,
    })
    if (error) { setErr(error.message); setLoading(false); return }
    onAdded()
  }

  return (
    <Modal title="Add Car to Garage" onClose={onClose}>
      <Row label="Make">
        <Autocomplete
          value={make} onChange={v => { setMake(v); setModel(''); setYear('') }}
          onSelect={v => { setMake(v); setModel(''); setYear('') }}
          suggestions={makes} placeholder="e.g. Toyota"
        />
      </Row>
      <Row label="Model">
        <Autocomplete
          value={model} onChange={v => { setModel(v); setYear('') }}
          onSelect={v => { setModel(v); setYear('') }}
          suggestions={models} placeholder="e.g. Supra"
        />
      </Row>
      {cars.length > 0 && (
        <Row label="Year">
          <select
            value={year} onChange={e => setYear(e.target.value)}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`,
              color: year ? t.text : t.dim, padding: '7px 10px', borderRadius: 4,
              fontSize: 14, fontFamily: t.mono, width: '100%', outline: 'none',
            }}
          >
            <option value="">Select year</option>
            {cars.map(c => <option key={c.id} value={c.year}>{c.year}</option>)}
          </select>
        </Row>
      )}
      {matched && (
        <div style={{
          background: t.surf2, border: `1px solid ${t.green}33`,
          borderRadius: 6, padding: '10px 14px', marginBottom: 14,
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, fontFamily: t.mono, color: t.green }}>✓ Found</span>
          {matched.stock_class    && <ClassBadge cls={matched.stock_class} pi={matched.stock_pi} />}
          {matched.stock_drivetrain && <DtBadge dt={matched.stock_drivetrain} />}
        </div>
      )}
      <Row label="Nickname (optional)">
        <input
          value={nickname} onChange={e => setNickname(e.target.value)}
          placeholder="e.g. Track build, Drift spec…"
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14,
            fontFamily: t.mono, width: '100%', outline: 'none',
          }}
        />
      </Row>
      {err && <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 10 }}>{err}</div>}
      <HR />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={add} disabled={loading || !matched}>{loading ? '…' : 'Add to Garage'}</Btn>
      </div>
    </Modal>
  )
}

// ── Garage main ───────────────────────────────────────────
export default function Garage({ userId, onSelectCar, showConfirm }) {
  const [userCars,    setUserCars]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [editingCar,  setEditingCar]  = useState(null)
  const [search,      setSearch]      = useState('')
  const isMobile = useIsMobile()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_cars').select('*, car:cars(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setUserCars(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  const remove = async (id) => {
    const ok = showConfirm
      ? await showConfirm({
          title: 'Remove car?',
          message: 'This will remove the car and all its builds from your garage.',
          confirmLabel: 'Remove',
        })
      : window.confirm('Remove this car?')
    if (!ok) return
    await supabase.from('user_cars').delete().eq('id', id)
    load()
  }

  const filtered = userCars.filter(uc => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      uc.car.make?.toLowerCase().includes(q) ||
      uc.car.model?.toLowerCase().includes(q) ||
      uc.nickname?.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ padding: isMobile ? '16px' : '20px 24px', maxWidth: 760, margin: '0 auto' }}>
      <SectionHead action={<Btn onClick={() => setShowAdd(true)}>+ Add Car</Btn>}>
        My Garage
      </SectionHead>

      {userCars.length > 3 && (
        <div style={{ marginBottom: 16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search garage…"
            style={{
              background: t.surf2, border: `1px solid ${t.border}`, color: t.text,
              padding: '7px 12px', borderRadius: 4, fontSize: 14,
              fontFamily: t.mono, width: '100%', outline: 'none',
            }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 48, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
        }}>
          {userCars.length === 0 ? 'Garage is empty — add your first car' : 'No cars match your search'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(uc => (
            <GarageCard
              key={uc.id} userCar={uc} car={uc.car}
              onClick={() => onSelectCar(uc)}
              onRemove={() => remove(uc.id)}
              onEditNickname={() => setEditingCar(uc)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddCarModal
          userId={userId}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load() }}
        />
      )}
      {editingCar && (
        <EditNicknameModal
          userCar={editingCar}
          onClose={() => setEditingCar(null)}
          onSaved={() => { setEditingCar(null); load() }}
        />
      )}
    </div>
  )
}

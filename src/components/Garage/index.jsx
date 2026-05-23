import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import {
  Btn, Label, Row, HR, Modal, Autocomplete,
  ClassBadge, DtBadge, SectionHead, Spinner,
} from '../UI/index.jsx'

// ── Car card in garage ────────────────────────────────────
function GarageCard({ userCar, car, onClick, onRemove }) {
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
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono }}>{car.year}</div>
        <div style={{
          fontFamily: t.head, fontSize: 22, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.04em', color: t.text, lineHeight: 1.1,
        }}>
          {car.make} {car.model}
        </div>
        {userCar.nickname && (
          <div style={{ fontSize: 12, color: t.accent, fontFamily: t.mono, marginTop: 2 }}>
            {userCar.nickname}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {car.stock_class && <ClassBadge cls={car.stock_class} pi={car.stock_pi} />}
        {car.stock_drivetrain && <DtBadge dt={car.stock_drivetrain} />}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onRemove() }}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'none', border: 'none', color: t.dim,
          fontSize: 14, cursor: 'pointer', lineHeight: 1,
          padding: '2px 6px',
        }}
        title="Remove from garage"
      >
        ✕
      </button>
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

  // Load all makes on open
  useEffect(() => {
    supabase.from('cars').select('make').eq('verified', true)
      .then(({ data }) => {
        const unique = [...new Set((data || []).map(r => r.make))].sort()
        setMakes(unique)
      })
  }, [])

  // Load models when make changes
  useEffect(() => {
    if (!make) { setModels([]); setModel(''); return }
    supabase.from('cars').select('model').eq('make', make).eq('verified', true)
      .then(({ data }) => {
        const unique = [...new Set((data || []).map(r => r.model))].sort()
        setModels(unique)
      })
  }, [make])

  // Load years when model changes
  useEffect(() => {
    if (!make || !model) { setCars([]); setYear(''); setMatched(null); return }
    supabase.from('cars')
      .select('*')
      .eq('make', make).eq('model', model).eq('verified', true)
      .order('year')
      .then(({ data }) => setCars(data || []))
  }, [make, model])

  // Match car when year selected
  useEffect(() => {
    if (!year) { setMatched(null); return }
    const found = cars.find(c => String(c.year) === String(year))
    setMatched(found || null)
  }, [year, cars])

  const add = async () => {
    if (!matched) { setErr('Select a car from the catalog'); return }
    setLoading(true); setErr('')
    const { error } = await supabase.from('user_cars').insert({
      user_id: userId,
      car_id: matched.id,
      nickname: nickname || null,
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
          disabled={!make}
        />
      </Row>
      {cars.length > 0 && (
        <Row label="Year">
          <select
            value={year} onChange={e => setYear(e.target.value)}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: year ? t.text : t.dim,
              padding: '7px 10px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
              width: '100%', outline: 'none',
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
          <div style={{ fontFamily: t.mono, fontSize: 13, color: t.green }}>✓ Found</div>
          {matched.stock_class && <ClassBadge cls={matched.stock_class} pi={matched.stock_pi} />}
          {matched.stock_drivetrain && <DtBadge dt={matched.stock_drivetrain} />}
        </div>
      )}
      <Row label="Nickname (optional)">
        <input
          value={nickname} onChange={e => setNickname(e.target.value)}
          placeholder="e.g. Track build, Drift spec…"
          style={{
            background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
            padding: '7px 10px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
            width: '100%', outline: 'none',
          }}
        />
      </Row>
      {err && <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={add} disabled={loading || !matched}>
          {loading ? '…' : 'Add to Garage'}
        </Btn>
      </div>
    </Modal>
  )
}

// ── Garage (main view) ────────────────────────────────────
export default function Garage({ userId, onSelectCar }) {
  const [userCars, setUserCars] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [search,   setSearch]   = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('user_cars')
      .select('*, car:cars(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setUserCars(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  const remove = async (id) => {
    if (!confirm('Remove this car from your garage?')) return
    await supabase.from('user_cars').delete().eq('id', id)
    load()
  }

  const filtered = userCars.filter(uc => {
    if (!search) return true
    const q = search.toLowerCase()
    const car = uc.car
    return (
      car.make?.toLowerCase().includes(q) ||
      car.model?.toLowerCase().includes(q) ||
      uc.nickname?.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 760, margin: '0 auto' }}>
      <SectionHead
        action={<Btn onClick={() => setShowAdd(true)}>+ Add Car</Btn>}
      >
        My Garage
      </SectionHead>

      {userCars.length > 3 && (
        <div style={{ marginBottom: 16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search garage…"
            style={{
              background: t.surf2, border: `1px solid ${t.border}`, color: t.text,
              padding: '7px 12px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
              width: '100%', outline: 'none',
            }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 64, color: t.dim,
          fontFamily: t.mono, fontSize: 13,
        }}>
          {userCars.length === 0
            ? 'Garage is empty — add your first car'
            : 'No cars match your search'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          {filtered.map(uc => (
            <GarageCard
              key={uc.id}
              userCar={uc}
              car={uc.car}
              onClick={() => onSelectCar(uc)}
              onRemove={() => remove(uc.id)}
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
    </div>
  )
}

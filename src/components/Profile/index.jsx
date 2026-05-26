import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { Btn, HR, SectionHead } from '../UI/index.jsx'

export default function Profile({ session, onBack }) {
  const user = session.user
  const [username, setUsername] = useState('')
  const [bio,      setBio]      = useState('')
  const [stats,    setStats]    = useState({ cars: 0, builds: 0 })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  // Password change
  const [showPw,   setShowPw]   = useState(false)
  const [pw1,      setPw1]      = useState('')
  const [pw2,      setPw2]      = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg,    setPwMsg]    = useState('')

  // Errors
  const [err, setErr] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Profile
      const { data: profile } = await supabase
        .from('profiles').select('username, bio').eq('id', user.id).maybeSingle()
      setUsername(profile?.username || user.user_metadata?.username || '')
      setBio(profile?.bio || '')

      // Stats
      const { count: cars } = await supabase
        .from('user_cars').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      // Get user_car IDs, then count builds for those cars
      const { data: ucIds } = await supabase
        .from('user_cars').select('id').eq('user_id', user.id)
      let buildCount = 0
      if (ucIds?.length) {
        const { count } = await supabase
          .from('builds').select('*', { count: 'exact', head: true })
          .in('user_car_id', ucIds.map(u => u.id))
        buildCount = count || 0
      }
      setStats({ cars: cars || 0, builds: buildCount })
      setLoading(false)
    }
    load()
  }, [user.id])

  const saveProfile = async () => {
    if (!username.trim()) { setErr('Username required'); return }
    setSaving(true); setErr('')
    await supabase.from('profiles').upsert({
      id: user.id, username: username.trim(), bio: bio.trim() || null,
    })
    await supabase.auth.updateUser({ data: { username: username.trim() } })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const changePassword = async () => {
    if (!pw1) { setPwMsg('Enter a new password'); return }
    if (pw1 !== pw2) { setPwMsg('Passwords do not match'); return }
    if (pw1.length < 6) { setPwMsg('Minimum 6 characters'); return }
    setPwSaving(true); setPwMsg('')
    const { error } = await supabase.auth.updateUser({ password: pw1 })
    if (error) { setPwMsg(error.message) }
    else { setPwMsg('Password updated successfully'); setPw1(''); setPw2(''); setShowPw(false) }
    setPwSaving(false)
  }

  const inp = (val, set, placeholder, type = 'text') => (
    <input
      type={type} value={val} placeholder={placeholder}
      onChange={e => set(e.target.value)}
      style={{
        background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
        padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: t.mono,
        width: '100%', outline: 'none',
      }}
    />
  )

  if (loading) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13 }}>
      Loading…
    </div>
  )

  return (
    <div style={{ padding: '20px 24px', maxWidth: 520, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.mid, fontFamily: t.mono,
          fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >← Back</button>

      <SectionHead>Profile</SectionHead>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24,
      }}>
        {[
          { label: 'Cars in garage', value: stats.cars },
          { label: 'Total builds',   value: stats.builds },
        ].map(s => (
          <div key={s.label} style={{
            background: t.surf, border: `1px solid ${t.border}`,
            borderRadius: 6, padding: '14px 18px',
          }}>
            <div style={{ fontFamily: t.head, fontSize: 28, fontWeight: 800, color: t.accent }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: t.dim, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <div style={{
        background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 20, marginBottom: 14,
      }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: t.mid, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Email
          </div>
          <div style={{ fontSize: 13, fontFamily: t.mono, color: t.dim, padding: '8px 0' }}>
            {user.email}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: t.mid, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Username
          </div>
          {inp(username, setUsername, 'Your username')}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: t.mid, fontFamily: t.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Bio (optional)
          </div>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            placeholder="A few words about yourself…"
            rows={3}
            style={{
              background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
              padding: '8px 12px', borderRadius: 4, fontSize: 13, fontFamily: t.mono,
              width: '100%', outline: 'none', resize: 'vertical',
            }}
          />
        </div>

        {err && <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 10 }}>{err}</div>}

        <Btn onClick={saveProfile} disabled={saving} full>
          {saving ? '…' : saved ? '✓ Saved' : 'Save Profile'}
        </Btn>
      </div>

      {/* Password change */}
      <div style={{
        background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8, padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPw ? 16 : 0 }}>
          <div style={{ fontSize: 13, fontFamily: t.mono, color: t.mid }}>Password</div>
          <Btn variant="ghost" small onClick={() => { setShowPw(p => !p); setPwMsg('') }}>
            {showPw ? 'Cancel' : 'Change'}
          </Btn>
        </div>
        {showPw && (
          <div>
            <div style={{ marginBottom: 10 }}>{inp(pw1, setPw1, 'New password', 'password')}</div>
            <div style={{ marginBottom: 12 }}>{inp(pw2, setPw2, 'Confirm password', 'password')}</div>
            {pwMsg && (
              <div style={{
                fontSize: 12, fontFamily: t.mono, marginBottom: 10,
                color: pwMsg.includes('success') ? t.green : t.red,
              }}>
                {pwMsg}
              </div>
            )}
            <Btn onClick={changePassword} disabled={pwSaving} full>
              {pwSaving ? '…' : 'Update Password'}
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}

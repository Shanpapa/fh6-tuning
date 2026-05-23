import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { Btn } from '../UI/index.jsx'

export default function Login() {
  const [mode,    setMode]    = useState('login')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [pass2,   setPass2]   = useState('')
  const [name,    setName]    = useState('')
  const [err,     setErr]     = useState('')
  const [ok,      setOk]      = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr(''); setOk('')
    if (!email || !pass) { setErr('Email and password required'); return }
    if (mode === 'signup') {
      if (pass !== pass2) { setErr('Passwords do not match'); return }
      if (pass.length < 6) { setErr('Min. 6 characters for password'); return }
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { username: name || email } },
      })
      if (error) { setErr(error.message); setLoading(false); return }
      setOk('Account created! You can now sign in.')
      setMode('login'); setPass(''); setPass2(''); setLoading(false)
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setErr(error.message)
    setLoading(false)
  }

  const inp = (val, set, placeholder, type = 'text') => (
    <input
      type={type} value={val} placeholder={placeholder}
      onChange={e => set(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && submit()}
      style={{
        background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
        padding: '8px 12px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
        width: '100%', outline: 'none', marginBottom: 10,
      }}
    />
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: t.bg,
    }}>
      <div style={{ width: 360 }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 4, height: 30, background: t.accent, borderRadius: 2 }} />
            <span style={{
              fontFamily: t.head, fontSize: 30, fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em', color: t.text,
            }}>
              FH6 Tuning
            </span>
          </div>
          <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono, marginLeft: 14 }}>
            Community tuning helper
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', marginBottom: 16, background: t.surf2,
          borderRadius: 6, padding: 3, gap: 3,
        }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(''); setOk('') }}
              style={{
                flex: 1, background: mode === m ? t.surf : 'transparent',
                border: mode === m ? `1px solid ${t.border}` : 'none',
                color: mode === m ? t.text : t.dim,
                padding: '8px', borderRadius: 4, fontSize: 12, fontFamily: t.mono,
                fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: t.surf, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: 24,
        }}>
          {mode === 'signup' && inp(name,  setName,  'Username (optional)')}
          {inp(email, setEmail, 'Email', 'email')}
          {inp(pass,  setPass,  'Password', 'password')}
          {mode === 'signup' && inp(pass2, setPass2, 'Confirm password', 'password')}

          {err && (
            <div style={{ color: t.red, fontSize: 12, fontFamily: t.mono, marginBottom: 12 }}>
              {err}
            </div>
          )}
          {ok && (
            <div style={{ color: t.green, fontSize: 12, fontFamily: t.mono, marginBottom: 12 }}>
              {ok}
            </div>
          )}

          <Btn onClick={submit} disabled={loading} full>
            {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

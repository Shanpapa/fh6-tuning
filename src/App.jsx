import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import { t } from './lib/theme.js'
import { Btn } from './components/UI/index.jsx'
import Login from './components/Auth/Login.jsx'
import Garage from './components/Garage/index.jsx'
import BuildEditor from './components/BuildEditor/index.jsx'
import Diagnostic from './components/Diagnostic/index.jsx'

// ── Top nav ───────────────────────────────────────────────
function Nav({ tab, setTab, username, onSignOut }) {
  const tabs = [
    { id: 'garage',   label: 'Garage' },
    { id: 'advisor',  label: 'Upgrades' },
    { id: 'diag',     label: 'Diagnose' },
  ]

  return (
    <div style={{
      background: t.surf, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '0 24px', height: 48, position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28 }}>
        <div style={{ width: 3, height: 22, background: t.accent, borderRadius: 2 }} />
        <span style={{
          fontFamily: t.head, fontSize: 20, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: t.text,
        }}>
          FH6 Tuning
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {tabs.map(({ id, label }) => (
          <button
            key={id} onClick={() => setTab(id)}
            style={{
              background: 'none', border: 'none', padding: '0 14px', height: 48,
              fontFamily: t.mono, fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
              color: tab === id ? t.accent : t.dim,
              borderBottom: tab === id ? `2px solid ${t.accent}` : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.dim }}>
          {username}
        </span>
        <Btn variant="ghost" small onClick={onSignOut}>Sign Out</Btn>
      </div>
    </div>
  )
}

// ── App root ──────────────────────────────────────────────
export default function App() {
  const [session,    setSession]    = useState(null)
  const [authReady,  setAuthReady]  = useState(false)
  const [tab,        setTab]        = useState('garage')
  const [activecar,  setActiveCar]  = useState(null)  // userCar object

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!authReady) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: t.bg,
      color: t.dim, fontSize: 13, fontFamily: t.mono,
    }}>
      Loading…
    </div>
  )

  if (!session) return <Login />

  const userId   = session.user.id
  const username = session.user.user_metadata?.username || session.user.email

  const signOut = () => {
    supabase.auth.signOut()
    setActiveCar(null)
    setTab('garage')
  }

  const handleSelectCar = (userCar) => {
    setActiveCar(userCar)
  }

  const handleBackToGarage = () => {
    setActiveCar(null)
    setTab('garage')
  }

  // If a car is selected → show BuildEditor (overrides tab)
  if (activecar) return (
    <>
      <Nav tab={tab} setTab={setTab} username={username} onSignOut={signOut} />
      <BuildEditor userCar={activecar} onBack={handleBackToGarage} />
    </>
  )

  return (
    <>
      <Nav tab={tab} setTab={setTab} username={username} onSignOut={signOut} />
      <main>
        {tab === 'garage' && (
          <Garage userId={userId} onSelectCar={handleSelectCar} />
        )}
        {tab === 'advisor' && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13 }}>
            Upgrade Advisor — coming soon
          </div>
        )}
        {tab === 'diag' && <Diagnostic />}
      </main>
    </>
  )
}

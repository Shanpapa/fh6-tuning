import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import { t } from './lib/theme.js'
import { Btn } from './components/UI/index.jsx'
import Login from './components/Auth/Login.jsx'
import Garage from './components/Garage/index.jsx'
import BuildEditor from './components/BuildEditor/index.jsx'
import Diagnostic from './components/Diagnostic/index.jsx'

// ── Leave build confirm modal ─────────────────────────────
function LeaveModal({ onLeave, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: t.surf, border: `1px solid ${t.borderHi}`,
        borderRadius: 8, padding: 28, width: 360,
      }}>
        <div style={{
          fontFamily: t.head, fontSize: 20, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: t.text, marginBottom: 10,
        }}>
          Leave build?
        </div>
        <div style={{ fontSize: 13, fontFamily: t.mono, color: t.mid, marginBottom: 24, lineHeight: 1.6 }}>
          Any unsaved changes to your upgrades or tune will be lost.
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onCancel}>Stay</Btn>
          <Btn variant="danger" onClick={onLeave}>Leave without saving</Btn>
        </div>
      </div>
    </div>
  )
}

// ── Top nav ───────────────────────────────────────────────
function Nav({ tab, onTabClick, username, onSignOut }) {
  const tabs = [
    { id: 'garage',  label: 'Garage'   },
    { id: 'advisor', label: 'Upgrades' },
    { id: 'diag',    label: 'Diagnose' },
  ]

  return (
    <div style={{
      background: t.surf, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', height: 48,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28 }}>
        <div style={{ width: 3, height: 22, background: t.accent, borderRadius: 2 }} />
        <span style={{
          fontFamily: t.head, fontSize: 20, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: t.text,
        }}>
          FH6 Tuning
        </span>
      </div>

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {tabs.map(({ id, label }) => (
          <button
            key={id} onClick={() => onTabClick(id)}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: t.mono, fontSize: 11, color: t.dim }}>{username}</span>
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
  const [activeCar,  setActiveCar]  = useState(null)
  const [pendingTab, setPendingTab] = useState(null)  // tab waiting for confirm

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
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
    setActiveCar(null); setTab('garage')
  }

  // Nav tab click — if in a build, ask before leaving
  const handleTabClick = (id) => {
    if (activeCar) {
      setPendingTab(id)   // triggers LeaveModal
    } else {
      setTab(id)
    }
  }

  const confirmLeave = () => {
    setActiveCar(null)
    setTab(pendingTab)
    setPendingTab(null)
  }

  const cancelLeave = () => setPendingTab(null)

  return (
    <>
      <Nav
        tab={activeCar ? null : tab}
        onTabClick={handleTabClick}
        username={username}
        onSignOut={signOut}
      />

      <main>
        {activeCar ? (
          <BuildEditor
            userCar={activeCar}
            onBack={() => setActiveCar(null)}
          />
        ) : (
          <>
            {tab === 'garage' && (
              <Garage userId={userId} onSelectCar={setActiveCar} />
            )}
            {tab === 'advisor' && (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13 }}>
                Upgrade Advisor — coming soon
              </div>
            )}
            {tab === 'diag' && <Diagnostic />}
          </>
        )}
      </main>

      {pendingTab && (
        <LeaveModal onLeave={confirmLeave} onCancel={cancelLeave} />
      )}
    </>
  )
}

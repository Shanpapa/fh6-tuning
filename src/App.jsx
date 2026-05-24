import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase.js'
import { t } from './lib/theme.js'
import { Btn } from './components/UI/index.jsx'
import Login from './components/Auth/Login.jsx'
import Garage from './components/Garage/index.jsx'
import BuildEditor from './components/BuildEditor/index.jsx'
import Diagnostic from './components/Diagnostic/index.jsx'
import Profile from './components/Profile/index.jsx'
import Advisor from './components/Advisor/index.jsx'
import { useIsMobile } from './lib/useIsMobile.js'

// ── Confirm modal (generic) ───────────────────────────────
function ConfirmModal({ title, message, confirmLabel, confirmVariant = 'danger', onConfirm, onCancel }) {
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
          {title}
        </div>
        <div style={{ fontSize: 13, fontFamily: t.mono, color: t.mid, marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  )
}

// ── Top nav ───────────────────────────────────────────────
function Nav({ tab, onTabClick, username, onSignOut, onProfile, activeCar, activeTab }) {
  const isMobile = useIsMobile()
  const tabs = [
    { id: 'garage',  label: 'Garage'   },
    { id: 'advisor', label: 'Advisor' },
    { id: 'diag',    label: 'Diagnose' },
  ]

  return (
    <div style={{
      background: t.surf, borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', height: 48,
      position: 'sticky', top: 0, zIndex: 50,
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
      <div style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
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

        {/* Breadcrumb — shown when in build */}
        {activeCar && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span style={{ color: t.border, fontSize: 14 }}>›</span>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.dim }}>
              {activeCar.car?.make} {activeCar.car?.model}
            </span>
            {activeTab && (
              <>
                <span style={{ color: t.border, fontSize: 14 }}>›</span>
                <span style={{ fontFamily: t.mono, fontSize: 11, color: t.accent, textTransform: 'uppercase' }}>
                  {activeTab}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* User area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onProfile}
          style={{
            background: 'none', border: `1px solid ${t.border}`, borderRadius: 4,
            color: t.mid, fontFamily: t.mono, fontSize: 11, cursor: 'pointer',
            padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.06em',
            transition: 'border-color 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = t.accent}
          onMouseOut={e => e.currentTarget.style.borderColor = t.border}
        >
          {isMobile ? (username.length > 8 ? username.slice(0,8)+'…' : username) : username}
        </button>
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
  const [activeTab,  setActiveTab]  = useState(null)  // build sub-tab
  const [pendingTab, setPendingTab] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  // Generic confirm modal state
  const [confirm,    setConfirm]    = useState(null)

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
  const username = session.user.user_metadata?.username || session.user.email?.split('@')[0]

  const signOut = () => {
    supabase.auth.signOut()
    setActiveCar(null); setTab('garage'); setShowProfile(false)
  }

  const handleTabClick = (id) => {
    if (activeCar) { setPendingTab(id) }
    else if (showProfile) { setShowProfile(false); setTab(id) }
    else { setTab(id) }
  }

  const handleProfileClick = () => {
    if (activeCar) { setPendingTab('__profile__') }
    else { setShowProfile(true) }
  }

  const confirmLeave = () => {
    setActiveCar(null)
    if (pendingTab === '__profile__') { setShowProfile(true); setTab('garage') }
    else { setTab(pendingTab); setShowProfile(false) }
    setPendingTab(null)
  }

  // Expose global confirm modal for garage delete etc.
  const showConfirm = (opts) => new Promise(resolve => {
    setConfirm({ ...opts, resolve })
  })

  const handleConfirm = () => { confirm.resolve(true);  setConfirm(null) }
  const handleCancel  = () => { confirm.resolve(false); setConfirm(null) }

  const currentTab = showProfile ? '__profile__' : activeCar ? null : tab

  return (
    <>
      <Nav
        tab={currentTab}
        onTabClick={handleTabClick}
        username={username}
        onSignOut={signOut}
        onProfile={handleProfileClick}
        activeCar={activeCar}
        activeTab={activeTab}
      />

      <main>
        {showProfile ? (
          <Profile session={session} onBack={() => setShowProfile(false)} />
        ) : activeCar ? (
          <BuildEditor
            userCar={activeCar}
            onBack={() => setActiveCar(null)}
            onTabChange={setActiveTab}
          />
        ) : (
          <>
            {tab === 'garage' && (
              <Garage userId={userId} onSelectCar={setActiveCar} showConfirm={showConfirm} />
            )}
            {tab === 'advisor' && (
              <Advisor userId={userId} />
            )}
            {tab === 'diag' && <Diagnostic />}
          </>
        )}
      </main>

      {/* Leave build modal */}
      {pendingTab && (
        <ConfirmModal
          title="Leave build?"
          message="Any unsaved changes to your upgrades or tune will be lost."
          confirmLabel="Leave without saving"
          onConfirm={confirmLeave}
          onCancel={() => setPendingTab(null)}
        />
      )}

      {/* Generic confirm modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel || 'Confirm'}
          confirmVariant={confirm.variant || 'danger'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

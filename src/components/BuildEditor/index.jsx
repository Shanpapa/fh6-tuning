import { t } from '../../lib/theme.js'

export default function BuildEditor({ userCar, onBack }) {
  const car = userCar?.car
  return (
    <div style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: t.dim, fontFamily: t.mono,
          fontSize: 12, cursor: 'pointer', marginBottom: 20, padding: 0,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}
      >
        ← Garage
      </button>
      <div style={{ fontFamily: t.head, fontSize: 26, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
        {car?.make} {car?.model}
      </div>
      <div style={{ color: t.dim, fontFamily: t.mono, fontSize: 13, marginBottom: 32 }}>
        Build editor — coming soon
      </div>
      <div style={{
        background: t.surf, border: `1px solid ${t.border}`, borderRadius: 8,
        padding: 32, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13,
      }}>
        Upgrades → Baseline Tune → Diagnostic
      </div>
    </div>
  )
}

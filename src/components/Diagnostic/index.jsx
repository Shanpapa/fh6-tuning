import { useState } from 'react'
import { t } from '../../lib/theme.js'
import { Btn, HR } from '../UI/index.jsx'
import { DIAG_CATEGORIES, getRecommendations } from '../../lib/diagnostics.js'

// ── Type badge ─────────────────────────────────────────────
const TYPE_COLORS = { TUNE: '#38bdf8', UPGRADE: '#f97316', CHECK: '#fbbf24' }

function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] ?? t.dim
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 3, padding: '1px 7px', fontSize: 10,
      fontFamily: t.mono, color, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
    }}>
      {type}
    </span>
  )
}

// ── Recommendation card ────────────────────────────────────
function RecCard({ rec, index }) {
  return (
    <div style={{
      background: t.surf, border: `1px solid ${t.border}`,
      borderRadius: 6, padding: '12px 16px', marginBottom: 8,
      borderLeft: `3px solid ${index === 0 ? t.accent : t.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, minWidth: 18, paddingTop: 1 }}>
          {index + 1}.
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <TypeBadge type={rec.type} />
            <span style={{
              fontFamily: t.head, fontSize: 16, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em', color: t.text,
            }}>
              {rec.param}
            </span>
          </div>
          <div style={{ fontSize: 13, fontFamily: t.mono, color: t.text, marginBottom: 6, wordBreak: 'break-word', lineHeight: 1.5 }}>
            → {rec.action}
          </div>
          <div style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, fontStyle: 'italic', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {rec.why}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Category selector ──────────────────────────────────────
function CategoryGrid({ onSelect }) {
  const [hover, setHover] = useState(null)
  return (
    <div>
      <div style={{
        fontFamily: t.head, fontSize: 22, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.06em', color: t.text, marginBottom: 6,
      }}>
        Vehicle Diagnostics
      </div>
      <div style={{ fontSize: 12, color: t.dim, fontFamily: t.mono, marginBottom: 24 }}>
        What's happening with your car?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {DIAG_CATEGORIES.map(cat => (
          <div
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            onMouseEnter={() => setHover(cat.id)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: t.surf,
              border: `1px solid ${hover === cat.id ? t.accent : t.border}`,
              borderRadius: 6, padding: '14px 16px', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6, lineHeight: 1 }}>{cat.icon}</div>
            <div style={{
              fontFamily: t.head, fontSize: 18, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em', color: t.text, marginBottom: 4,
            }}>
              {cat.label}
            </div>
            <div style={{ fontSize: 11, fontFamily: t.mono, color: t.dim, lineHeight: 1.4 }}>
              {cat.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Question step ──────────────────────────────────────────
function QuestionStep({ question, onAnswer }) {
  const [hover, setHover] = useState(null)
  return (
    <div>
      <div style={{
        fontFamily: t.head, fontSize: 19, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', color: t.text, marginBottom: 20,
      }}>
        {question.text}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {question.options.map(opt => (
          <div
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            onMouseEnter={() => setHover(opt.value)}
            onMouseLeave={() => setHover(null)}
            style={{
              background: hover === opt.value ? t.surf3 : t.surf2,
              border: `1px solid ${hover === opt.value ? t.accent : t.border}`,
              borderRadius: 6, padding: '12px 16px', cursor: 'pointer',
              transition: 'all 0.12s', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: t.mono, fontSize: 13, color: t.text, fontWeight: 700, marginBottom: 2 }}>
                {opt.label}
              </div>
              {opt.desc && (
                <div style={{ fontSize: 11, fontFamily: t.mono, color: t.dim }}>{opt.desc}</div>
              )}
            </div>
            <span style={{ color: t.dim, fontSize: 16 }}>→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Results ────────────────────────────────────────────────
function Results({ category, answers, recs, onReset }) {
  const cat = DIAG_CATEGORIES.find(c => c.id === category)
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontFamily: t.mono, color: t.dim,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
        }}>
          Diagnosis
        </div>
        <div style={{
          fontFamily: t.head, fontSize: 22, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.06em', color: t.accent,
        }}>
          {cat?.label}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {Object.entries(answers).map(([k, v]) => (
            <span key={k} style={{
              background: t.surf2, border: `1px solid ${t.border}`,
              borderRadius: 3, padding: '2px 8px',
              fontSize: 11, fontFamily: t.mono, color: t.mid,
            }}>
              {v}
            </span>
          ))}
        </div>
      </div>
      <HR />
      <div style={{
        fontSize: 11, fontFamily: t.mono, color: t.dim,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        Recommended fixes — try in order
      </div>
      {recs.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: t.dim, fontFamily: t.mono, fontSize: 13 }}>
          No specific recommendations for this combination
        </div>
      ) : (
        recs.map((rec, i) => <RecCard key={i} rec={rec} index={i} />)
      )}
      <div style={{ marginTop: 20 }}>
        <Btn variant="ghost" onClick={onReset}>← New Diagnosis</Btn>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function Diagnostic() {
  const [stage,   setStage]   = useState('select')
  const [catId,   setCatId]   = useState(null)
  const [qIndex,  setQIndex]  = useState(0)
  const [answers, setAnswers] = useState({})
  const [recs,    setRecs]    = useState([])

  const cat = DIAG_CATEGORIES.find(c => c.id === catId)

  const selectCategory = (id) => {
    setCatId(id); setAnswers({}); setQIndex(0); setStage('question')
  }

  const answer = (value) => {
    const q = cat.questions[qIndex]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)
    if (qIndex + 1 < cat.questions.length) {
      setQIndex(qIndex + 1)
    } else {
      setRecs(getRecommendations(catId, newAnswers))
      setStage('results')
    }
  }

  const reset = () => {
    setStage('select'); setCatId(null); setAnswers({}); setQIndex(0); setRecs([])
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 760, margin: '0 auto' }}>
      {stage !== 'select' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <button
            onClick={reset}
            style={{
              background: 'none', border: 'none', color: t.dim, fontFamily: t.mono,
              fontSize: 11, cursor: 'pointer', padding: 0,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >← Diagnose</button>
          {cat && <>
            <span style={{ color: t.border }}>›</span>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.accent, textTransform: 'uppercase' }}>
              {cat.label}
            </span>
          </>}
          {stage === 'question' && <>
            <span style={{ color: t.border }}>›</span>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.dim }}>
              Q {qIndex + 1} / {cat?.questions.length}
            </span>
          </>}
        </div>
      )}
      {stage === 'select'   && <CategoryGrid onSelect={selectCategory} />}
      {stage === 'question' && cat && <QuestionStep question={cat.questions[qIndex]} onAnswer={answer} />}
      {stage === 'results'  && <Results category={catId} answers={answers} recs={recs} onReset={reset} />}
    </div>
  )
}

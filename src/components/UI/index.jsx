// ── UI ATOMS ──────────────────────────────────────────────
// Shared across all components. Keep stateless.
import { useState } from 'react'
import { t, CLASS_COLORS, DT_COLORS } from '../lib/theme.js'

// ── Primitives ────────────────────────────────────────────

export const Input = ({ value, onChange, placeholder, type = 'text', step, disabled }) => (
  <input
    type={type} value={value ?? ''} step={step} disabled={disabled}
    placeholder={placeholder || ''}
    onChange={e => onChange(
      type === 'number'
        ? (e.target.value === '' ? '' : parseFloat(e.target.value))
        : e.target.value
    )}
    style={{
      background: t.surf3, border: `1px solid ${t.border}`, color: t.text,
      padding: '7px 10px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
      width: '100%', outline: 'none', opacity: disabled ? 0.5 : 1,
    }}
  />
)

export const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    value={value ?? ''} disabled={disabled}
    onChange={e => onChange(e.target.value)}
    style={{
      background: t.surf3, border: `1px solid ${t.border}`,
      color: value ? t.text : t.dim,
      padding: '7px 10px', borderRadius: 4, fontSize: 14, fontFamily: t.mono,
      width: '100%', outline: 'none', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => (
      <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
    ))}
  </select>
)

export const Btn = ({ children, onClick, variant = 'primary', small, disabled, full }) => {
  const bg    = { primary: t.accent, ghost: 'transparent', danger: 'transparent', green: t.green, blue: t.blue }[variant]
  const color = { primary: '#000',   ghost: t.dim,         danger: t.red,         green: '#000',  blue: '#000'  }[variant]
  const bdr   = { primary: 'none', ghost: `1px solid ${t.border}`, danger: `1px solid ${t.red}44`, green: 'none', blue: 'none' }[variant]
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        background: disabled ? t.surf2 : bg, border: bdr,
        color: disabled ? t.dim : color,
        padding: small ? '5px 12px' : '8px 18px',
        borderRadius: 4, fontSize: small ? 10 : 11, fontFamily: t.mono,
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        cursor: disabled ? 'default' : 'pointer', transition: 'opacity 0.15s',
        opacity: disabled ? 0.5 : 1, width: full ? '100%' : undefined,
      }}
    >
      {children}
    </button>
  )
}

export const Label = ({ children }) => (
  <div style={{
    fontSize: 11, fontFamily: t.mono, color: t.dim,
    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4,
  }}>
    {children}
  </div>
)

export const Tag = ({ children, color }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}44`,
    borderRadius: 3, padding: '2px 8px', fontSize: 11, fontFamily: t.mono, color,
  }}>
    {children}
  </span>
)

export const ClassBadge = ({ cls, pi }) => {
  const color = CLASS_COLORS[cls] ?? t.dim
  return (
    <span style={{
      background: `${color}20`, border: `1px solid ${color}55`,
      borderRadius: 3, padding: '2px 8px', fontSize: 12, fontFamily: t.mono,
      color, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {cls}{pi ? ` ${pi}` : ''}
    </span>
  )
}

export const DtBadge = ({ dt }) => {
  const color = DT_COLORS[dt] ?? t.dim
  return <Tag color={color}>{dt}</Tag>
}

export const Row = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <Label>{label}</Label>
    {children}
  </div>
)

export const HR = () => (
  <div style={{ borderTop: `1px solid ${t.border}`, margin: '16px 0' }} />
)

export const Spinner = () => (
  <div style={{
    width: 16, height: 16, borderRadius: '50%',
    border: `2px solid ${t.border}`, borderTopColor: t.accent,
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  }} />
)

// ── Modal ─────────────────────────────────────────────────

export const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
  }}>
    <div style={{
      background: t.surf, border: `1px solid ${t.borderHi}`, borderRadius: 8,
      width: '100%', maxWidth: wide ? 640 : 480, maxHeight: '90vh', overflow: 'auto',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: `1px solid ${t.border}`,
      }}>
        <span style={{
          fontFamily: t.head, fontSize: 19, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em', color: t.text,
        }}>
          {title}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: t.dim, fontSize: 18, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
)

// ── Autocomplete ──────────────────────────────────────────

export function Autocomplete({ value, onChange, onSelect, suggestions, placeholder, loading }) {
  const [open, setOpen] = useState(false)
  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes((value || '').toLowerCase()) && s !== value
  )
  const show = open && filtered.length > 0

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value ?? ''}
        placeholder={placeholder || ''}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{
          background: t.surf3,
          border: `1px solid ${open ? t.accent : t.border}`,
          color: t.text, padding: '7px 10px', borderRadius: 4, fontSize: 14,
          fontFamily: t.mono, width: '100%', outline: 'none',
        }}
      />
      {loading && (
        <div style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 11, color: t.dim, fontFamily: t.mono,
        }}>…</div>
      )}
      {show && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: t.surf2, border: `1px solid ${t.accent}`, borderTop: 'none',
          borderRadius: '0 0 4px 4px', maxHeight: 200, overflowY: 'auto',
        }}>
          {filtered.map(s => (
            <div
              key={s}
              onMouseDown={() => { onSelect(s); setOpen(false) }}
              style={{
                padding: '8px 12px', fontSize: 14, fontFamily: t.mono,
                color: t.text, cursor: 'pointer', borderBottom: `1px solid ${t.border}33`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.surf3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section header ────────────────────────────────────────

export const SectionHead = ({ children, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  }}>
    <div style={{
      fontFamily: t.head, fontSize: 15, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.1em', color: t.mid,
    }}>
      {children}
    </div>
    {action}
  </div>
)

// CSS for spinner animation (injected once)
if (typeof document !== 'undefined' && !document.getElementById('ui-keyframes')) {
  const style = document.createElement('style')
  style.id = 'ui-keyframes'
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(style)
}

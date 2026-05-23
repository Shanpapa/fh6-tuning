import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { t } from '../../lib/theme.js'
import { Btn, HR } from '../UI/index.jsx'

export default function NotesTab({ build }) {
  const [notes,  setNotes]  = useState(build.notes || '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('builds')
      .update({ notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', build.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        fontSize: 11, color: t.dim, fontFamily: t.mono,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
      }}>
        Build Notes
      </div>
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        placeholder="Parts rationale, tune changes, track notes, reminders…"
        rows={12}
        style={{
          background: t.surf, border: `1px solid ${t.border}`,
          color: t.text, padding: '12px 14px', borderRadius: 6,
          fontSize: 13, fontFamily: t.mono, width: '100%',
          outline: 'none', resize: 'vertical', lineHeight: 1.7,
        }}
        onFocus={e => e.currentTarget.style.borderColor = t.accent}
        onBlur={e => e.currentTarget.style.borderColor = t.border}
      />
      <HR />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={save} disabled={saving}>
          {saving ? '…' : saved ? '✓ Saved' : 'Save Notes'}
        </Btn>
      </div>
    </div>
  )
}

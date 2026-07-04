import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8386D">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

export default function LiveStory() {
  const [name, setName] = useState('')
  const [table, setTable] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get('t')) setTable(p.get('t'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSaving(true)
    await supabase.from('story_cards').insert({
      name: name.trim(),
      table_number: table.trim() || null,
      message: message.trim(),
    })
    setSaving(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #FFF5F8 0%, #fff 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", padding: 24
      }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <HeartIcon />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginTop: 16 }}>
            Story sent!
          </h2>
          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6, marginTop: 8 }}>
            Your card has been added to the live feed. Keep watching the stage!
          </p>
          <button
            onClick={() => { setSubmitted(false); setName(''); setTable(''); setMessage('') }}
            style={{
              marginTop: 24, padding: '12px 28px', borderRadius: 999,
              background: '#E8386D', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Send another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #FFF5F8 0%, #fff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <HeartIcon />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginTop: 12, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Live Story Cards
          </h1>
          <p style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
            Scan the QR code at your table? Share your story below — live on stage.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What should we call you?"
              required
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1.5px solid #F0F0F0', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', background: '#fff', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>
              Table Number
            </label>
            <input
              type="text"
              value={table}
              onChange={e => setTable(e.target.value)}
              placeholder="e.g. Table 5"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1.5px solid #F0F0F0', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', background: '#fff', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6 }}>
              Your Story *
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Drop a fun fact, a roasts, a match request, or just say hi to the room..."
              required
              rows={4}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: '1.5px solid #F0F0F0', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', background: '#fff', resize: 'vertical',
                lineHeight: 1.6, boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '16px', borderRadius: 999,
              background: saving ? '#F5B8CF' : '#E8386D', color: '#fff',
              border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', marginTop: 4
            }}
          >
            {saving ? 'Sending...' : 'Send to Stage ✨'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import ChipGroup from '../components/ChipGroup'
import ErrorBanner from '../components/ErrorBanner'
import { useCapacity } from '../hooks/useCapacity'
import { supabase } from '../utils/supabaseClient'
import { trackLead } from '../lib/tracking'

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="role-icon">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
)

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="role-icon">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

function getInitial() {
  try { const s = sessionStorage.getItem('ptp_step1'); if (s) return JSON.parse(s) } catch (_) {}
  return { name: '', phone: '', email: '', role: sessionStorage.getItem('ptp_role') || '' }
}

export default function RegisterStep1() {
  const navigate = useNavigate()
  const [form, setForm] = useState(getInitial)
  const [errors, setErrors] = useState({})
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const timeoutRef = useRef(null)
  const { remaining, isSoldOut } = useCapacity()

  const pitcherFull = isSoldOut.pitcher_male && isSoldOut.pitcher_female
  const watcherFull = isSoldOut.watcher
  const selectedIsFull = (form.role === 'pitcher' && pitcherFull) || (form.role === 'watcher' && watcherFull)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    if (Object.keys(errors).length <= 1) {
      setShowErrorBanner(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Please enter your full name'
    if (!form.phone.trim()) e.phone = 'Please enter your WhatsApp number'
    if (!form.email.trim()) e.email = 'Please enter your email'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.role) e.role = 'Please pick your role'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setShowErrorBanner(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setShowErrorBanner(false), 3000)
      return
    }
    setShowErrorBanner(false)

    // If sold out → save as waitlist, skip payment
    if (selectedIsFull) {
      setSaving(true)
      try {
        trackLead({ role: form.role, waitlist: true })
        await supabase.from('registrations').insert({
          name: form.name,
          whatsapp: form.phone,
          email: form.email,
          role: form.role,
          status: 'waitlist',
        })
      } catch (err) {
        console.error('Waitlist save error:', err)
      }
      setSaving(false)
      sessionStorage.removeItem('ptp_step1')
      navigate('/waitlist')
      return
    }

    // Normal flow
    trackLead({ role: form.role })
    sessionStorage.setItem('ptp_step1', JSON.stringify(form))
    navigate(form.role === 'pitcher' ? '/register/pitcher' : '/register/watcher')
  }

  return (
    <PageShell
      badge="Registration Open"
      title="Pitch Them Perfect"
      tagline="Think they're the one? Prove it."
      desc="Register your interest for the next edition of Pitch Them Perfect. Whether you're here to take the mic or watch the magic happen, we want to hear from you."
      step={1}
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>

        <FormCard number="1" title="About You">
          <div className="field">
            <label className="field-label" htmlFor="name">Full Name <span className="req">*</span></label>
            <input id="name" type="text" autoComplete="name" placeholder="Your full name"
              value={form.name} onChange={e => set('name', e.target.value)}
              className={errors.name ? 'has-error' : ''} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">WhatsApp Number <span className="req">*</span></label>
            <input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+971 50 123 4567"
              value={form.phone} onChange={e => set('phone', e.target.value)}
              className={errors.phone ? 'has-error' : ''} />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="email">Email Address <span className="req">*</span></label>
            <input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)}
              className={errors.email ? 'has-error' : ''} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
        </FormCard>

        <FormCard number="2" title="Pick Your Role">
          <ChipGroup
            label="How are you joining Pitch Them Perfect?"
            options={[
              { value: 'pitcher', label: "I'm here to pitch someone", icon: <MicIcon /> },
              { value: 'watcher', label: "I'm here to watch the pitches", icon: <EyeIcon /> },
            ]}
            value={form.role}
            onChange={v => set('role', v)}
            required
            error={errors.role}
            roleStyle
          />
          {selectedIsFull && (
            <div className="waitlist-notice">
              <p className="waitlist-notice-title">This category is currently full.</p>
              <p className="waitlist-notice-desc">
                You can still join the waitlist — we'll prioritise you if spots open up.
                No payment needed right now.
              </p>
            </div>
          )}
        </FormCard>

        <div className="submit-wrapper">
          {showErrorBanner && <ErrorBanner />}
          <button id="btn-continue" type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : selectedIsFull ? 'Join Waitlist' : 'Continue \u00A0→'}
          </button>
        </div>
      </form>
    </PageShell>
  )
}

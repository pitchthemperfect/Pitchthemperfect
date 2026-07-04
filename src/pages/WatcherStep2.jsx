import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import ChipGroup from '../components/ChipGroup'
import ConsentCheckbox from '../components/ConsentCheckbox'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
]

const AGE_OPTIONS = [
  { value: '21-25', label: '21-25' },
  { value: '26-30', label: '26-30' },
  { value: '30-35', label: '30-35' },
  { value: '35-40', label: '35-40' },
  { value: '50+',   label: '50+' },
]

function getInitial() {
  try { const s = sessionStorage.getItem('ptp_watcher2'); if (s) return JSON.parse(s) } catch (_) {}
  return { gender: '', age: '', looking_for: '', consent: false }
}

export default function WatcherStep2() {
  const navigate = useNavigate()
  const [form, setForm] = useState(getInitial)
  const [errors, setErrors] = useState({})
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const timeoutRef = useRef(null)

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
    if (!form.gender)  e.gender  = 'Please select your gender'
    if (!form.age)     e.age     = 'Please select your age category'
    if (!form.consent) e.consent = 'Please accept to continue'
    return e
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setShowErrorBanner(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        setShowErrorBanner(false)
      }, 3000)
      return
    }
    setShowErrorBanner(false)
    sessionStorage.setItem('ptp_watcher2', JSON.stringify(form))
    navigate('/payment/watcher')
  }

  return (
    <PageShell
      badge="Registration Open"
      title="Pitch Them Perfect"
      tagline="Think they're the one? Prove it."
      desc="Register your interest for the next edition of Pitch Them Perfect. Whether you're here to take the mic or watch the magic happen, we want to hear from you."
      step={2}
    >
      <BackButton to="/registration" />

      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
        <FormCard number="2" title="Audience Details">
          <ChipGroup
            label="Are you?"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={v => set('gender', v)}
            required
            error={errors.gender}
          />
          <ChipGroup
            label="Age Category"
            options={AGE_OPTIONS}
            value={form.age}
            onChange={v => set('age', v)}
            required
            error={errors.age}
          />
        </FormCard>

        <FormCard>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#111', display: 'block', marginBottom: 8 }}>
            Who would you love to meet? <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={form.looking_for}
            onChange={e => set('looking_for', e.target.value)}
            placeholder="e.g. Someone who loves hiking and bad puns..."
            style={{
              width: '100%', padding: '14px 16px', border: '1.5px solid #EBEBEB',
              borderRadius: 12, fontSize: 14, fontFamily: 'inherit', outline: 'none',
              background: '#FAFAFA', boxSizing: 'border-box'
            }}
          />
        </FormCard>

        <ConsentCheckbox
          id="watcher-consent"
          checked={form.consent}
          onChange={v => set('consent', v)}
          error={errors.consent}
        >
          I'm happy for Pitch Them Perfect to contact me via WhatsApp and email about this event and future editions. <span className="req">*</span>
        </ConsentCheckbox>

        <div className="submit-wrapper">
          {showErrorBanner && <ErrorBanner />}
          <button id="btn-proceed" type="submit" className="btn-primary">
            Proceed to Payment
          </button>
        </div>
      </form>
    </PageShell>
  )
}

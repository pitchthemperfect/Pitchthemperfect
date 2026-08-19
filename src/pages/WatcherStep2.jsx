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
  try { 
    const s = sessionStorage.getItem('ptp_watcher2')
    if (s) return JSON.parse(s) 
  } catch (_) {}
  return { gender: '', age: '', nationality: '', consent: false }
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
    if (!form.gender)            e.gender      = 'Please select your gender'
    if (!form.age)               e.age         = 'Please select your age category'
    if (!form.nationality.trim()) e.nationality = 'Please enter your nationality'
    if (!form.consent)           e.consent     = 'Please accept to continue'
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

          {/* Nationality Field Styled like Reference Image */}
          <div 
            className="form-group" 
            style={{ 
              marginTop: '1.5rem', 
              marginBottom: '1rem',
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <label 
              htmlFor="nationality" 
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '0.5rem',
                fontFamily: 'inherit'
              }}
            >
              Nationality <span style={{ color: '#1a1a1a', marginLeft: '0.2rem' }}>*</span>
            </label>

            <input
              id="nationality"
              type="text"
              placeholder="e.g. Italian, Japanese, Canadian"
              value={form.nationality}
              onChange={e => set('nationality', e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                fontSize: '1rem',
                color: '#1a1a1a',
                backgroundColor: '#fafafa',
                border: errors.nationality ? '1px solid #dc2626' : '1px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
            />

            {errors.nationality && (
              <span 
                className="error-text" 
                style={{ 
                  color: '#dc2626', 
                  fontSize: '0.85rem', 
                  marginTop: '0.4rem',
                  fontWeight: '500' 
                }}
              >
                {errors.nationality}
              </span>
            )}
          </div>
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

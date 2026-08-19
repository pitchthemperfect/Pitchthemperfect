import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import ChipGroup from '../components/ChipGroup'
import ConsentCheckbox from '../components/ConsentCheckbox'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'
import { useCapacity } from '../hooks/useCapacity'

const RELATIONSHIP_OPTIONS = [
  { value: 'friend',    label: 'Friend' },
  { value: 'family',    label: 'Family Member' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'partner',   label: 'Partner' },
  { value: 'other',     label: 'Other' },
]

const ATTEND_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
]

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
]

function getInitial() {
  try { const s = sessionStorage.getItem('ptp_pitcher2'); if (s) return JSON.parse(s) } catch (_) {}
  return { theirName: '', instagram: '', pitcheeGender: '', relationship: '', canAttend: '', pitch: '', links: '', consent: false }
}

export default function PitcherStep2() {
  const navigate = useNavigate()
  const [form, setForm] = useState(getInitial)
  const [errors, setErrors] = useState({})
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const [genderFullWarning, setGenderFullWarning] = useState('')
  const timeoutRef = useRef(null)
  const { isSoldOut } = useCapacity()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    if (k === 'pitcheeGender') {
      // Check if that gender is full
      const full = v === 'female' ? isSoldOut.pitcher_female : isSoldOut.pitcher_male
      setGenderFullWarning(full ? `This category is currently full. You can still nominate, but you'll be placed on the waitlist.` : '')
    }
    if (Object.keys(errors).length <= 1) {
      setShowErrorBanner(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.theirName.trim()) e.theirName    = 'Please enter their name and age'
    if (!form.instagram.trim()) e.instagram    = 'Please enter their Instagram handle'
    if (!form.relationship)     e.relationship = 'Please select your relationship'
    if (!form.pitcheeGender)    e.pitcheeGender = 'Please select their gender'
    if (!form.canAttend)        e.canAttend    = 'Please answer this'
    if (!form.pitch.trim())     e.pitch        = 'Please write your pitch'
    if (!form.consent)          e.consent      = 'Please accept to continue'
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
    sessionStorage.setItem('ptp_pitcher2', JSON.stringify(form))
    navigate('/payment/pitcher')
  }

  // Shared style definition matching the reference input
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.875rem 1.25rem',
    fontSize: '1rem',
    color: '#1a1a1a',
    backgroundColor: '#fbfbfb',
    border: hasError ? '1px solid #dc2626' : '1px solid #e0e0e0',
    borderRadius: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  })

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
        <FormCard number="2" title="Your Pitch">

          {/* Their Name & Age */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="theirName" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Their Name &amp; Age <span className="req">*</span>
            </label>
            <input
              id="theirName"
              type="text"
              autoComplete="off"
              placeholder="e.g. Sarah, 26"
              value={form.theirName}
              onChange={e => set('theirName', e.target.value)}
              className={`form-input ${errors.theirName ? 'is-invalid' : ''}`}
              style={inputStyle(errors.theirName)}
            />
            {errors.theirName && (
              <span className="error-text" style={{ marginTop: '0.4rem', display: 'block' }}>
                {errors.theirName}
              </span>
            )}
          </div>

          {/* Their Instagram Handle */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="instagram" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Their Instagram Handle <span className="req">*</span>
            </label>
            <input
              id="instagram"
              type="text"
              autoComplete="off"
              placeholder="@theirhandle"
              value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              className={`form-input ${errors.instagram ? 'is-invalid' : ''}`}
              style={inputStyle(errors.instagram)}
            />
            {errors.instagram && (
              <span className="error-text" style={{ marginTop: '0.4rem', display: 'block' }}>
                {errors.instagram}
              </span>
            )}
          </div>

          <ChipGroup
            label="What's your relationship to them?"
            options={RELATIONSHIP_OPTIONS}
            value={form.relationship}
            onChange={v => set('relationship', v)}
            required
            error={errors.relationship}
          />

          <ChipGroup
            label="Their Gender"
            options={GENDER_OPTIONS}
            value={form.pitcheeGender}
            onChange={v => set('pitcheeGender', v)}
            required
            error={errors.pitcheeGender}
          />

          {genderFullWarning && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, background: '#FFFBF0',
              border: '1.5px solid #F0C000', marginTop: 8, marginBottom: 8
            }}>
              <p style={{ fontSize: 13, color: '#B8860B', fontWeight: 600, margin: 0 }}>⚠️ {genderFullWarning}</p>
            </div>
          )}

          <ChipGroup
            label="Can both of you attend in person?"
            options={ATTEND_OPTIONS}
            value={form.canAttend}
            onChange={v => set('canAttend', v)}
            required
            error={errors.canAttend}
          />

          {/* Tell us about them & pitch them! */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="pitch" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Tell us about them &amp; pitch them! <span className="req">*</span>
            </label>
            <textarea
              id="pitch"
              autoComplete="off"
              rows={5}
              placeholder={'• Who are they? What makes them special?\n• Why should the room fall in love with them?\n• Make it charming, funny, heartfelt — whatever makes your pitch unforgettable'}
              value={form.pitch}
              onChange={e => set('pitch', e.target.value)}
              className={`form-input ${errors.pitch ? 'is-invalid' : ''}`}
              style={{
                ...inputStyle(errors.pitch),
                resize: 'vertical',
                lineHeight: '1.5'
              }}
            />
            {errors.pitch && (
              <span className="error-text" style={{ marginTop: '0.4rem', display: 'block' }}>
                {errors.pitch}
              </span>
            )}
          </div>

          {/* Optional: Links */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="links" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Optional: Share any links that help your case.
            </label>
            <input
              id="links"
              type="text"
              autoComplete="off"
              placeholder="Instagram, LinkedIn, portfolio, articles, videos, or anything else we should see."
              value={form.links}
              onChange={e => set('links', e.target.value)}
              className="form-input"
              style={inputStyle(false)}
            />
          </div>

        </FormCard>

        <ConsentCheckbox
          id="pitcher-consent"
          checked={form.consent}
          onChange={v => set('consent', v)}
          error={errors.consent}
        >
          I confirm I have my friend's permission to nominate them. <span className="req">*</span>
        </ConsentCheckbox>

        <div className="submit-wrapper">
          {showErrorBanner && <ErrorBanner />}
          <button id="btn-submit-pitch" type="submit" className="btn-primary">
            Submit My Pitch
          </button>
        </div>
      </form>
    </PageShell>
  )
}

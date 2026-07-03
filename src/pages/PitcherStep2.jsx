import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import ChipGroup from '../components/ChipGroup'
import ConsentCheckbox from '../components/ConsentCheckbox'
import BackButton from '../components/BackButton'
import ErrorBanner from '../components/ErrorBanner'

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

function getInitial() {
  try { const s = sessionStorage.getItem('ptp_pitcher2'); if (s) return JSON.parse(s) } catch (_) {}
  return { theirName: '', instagram: '', relationship: '', canAttend: '', pitch: '', links: '', consent: false }
}

export default function PitcherStep2() {
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
    if (!form.theirName.trim()) e.theirName    = 'Please enter their name and age'
    if (!form.instagram.trim()) e.instagram    = 'Please enter their Instagram handle'
    if (!form.relationship)     e.relationship = 'Please select your relationship'
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

  return (
    <PageShell
      badge="Registration Open"
      title="Pitch Them Perfect"
      tagline="Think they're the one? Prove it."
      desc="Register your interest for the next edition of Pitch Them Perfect. Whether you're here to take the mic or watch the magic happen, we want to hear from you."
      step={2}
    >
      <BackButton to="/register" />

      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
        <FormCard number="2" title="Your Pitch">

          <div className="field">
            <label className="field-label" htmlFor="theirName">Their Name & Age <span className="req">*</span></label>
            <input id="theirName" type="text" autoComplete="off" placeholder="e.g. Sarah, 26"
              value={form.theirName} onChange={e => set('theirName', e.target.value)}
              className={errors.theirName ? 'has-error' : ''} />
            {errors.theirName && <span className="field-error">{errors.theirName}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="instagram">Their Instagram Handle <span className="req">*</span></label>
            <input id="instagram" type="text" autoComplete="off" placeholder="@theirhandle"
              value={form.instagram} onChange={e => set('instagram', e.target.value)}
              className={errors.instagram ? 'has-error' : ''} />
            {errors.instagram && <span className="field-error">{errors.instagram}</span>}
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
            label="Can both of you attend in person?"
            options={ATTEND_OPTIONS}
            value={form.canAttend}
            onChange={v => set('canAttend', v)}
            required
            error={errors.canAttend}
          />

          <div className="field">
            <label className="field-label" htmlFor="pitch">
              Tell us about them &amp; pitch them! <span className="req">*</span>
            </label>
            <textarea id="pitch" autoComplete="off"
              placeholder={'• Who are they? What makes them special?\n• Why should the room fall in love with them?\n• Make it charming, funny, heartfelt — whatever makes your pitch unforgettable'}
              value={form.pitch} onChange={e => set('pitch', e.target.value)}
              className={errors.pitch ? 'has-error' : ''} />
            {errors.pitch && <span className="field-error">{errors.pitch}</span>}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="links">
              Optional: Share any links that help your case.
            </label>
            <input id="links" type="text" autoComplete="off"
              placeholder="Instagram, LinkedIn, portfolio, articles, videos, or anything else we should see."
              value={form.links} onChange={e => set('links', e.target.value)} />
          </div>

        </FormCard>

        <ConsentCheckbox
          id="pitcher-consent"
          checked={form.consent}
          onChange={v => set('consent', v)}
          error={errors.consent}
        >
          I'm happy for Pitch Them Perfect to contact me via WhatsApp and email about this event and future editions. <span className="req">*</span>
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

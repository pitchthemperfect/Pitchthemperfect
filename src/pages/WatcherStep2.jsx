import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import countryList from 'react-select-country-list'

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
  return { gender: '', age: '', nationality: null, consent: false }
}

export default function WatcherStep2() {
  const navigate = useNavigate()
  const [form, setForm] = useState(getInitial)
  const [errors, setErrors] = useState({})
  const [showErrorBanner, setShowErrorBanner] = useState(false)
  const timeoutRef = useRef(null)

  // Mengambil daftar negara dari library
  const countryOptions = useMemo(() => countryList().getData(), [])

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
    if (!form.gender)      e.gender      = 'Please select your gender'
    if (!form.age)         e.age         = 'Please select your age category'
    if (!form.nationality) e.nationality = 'Please select your nationality'
    if (!form.consent)     e.consent     = 'Please accept to continue'
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

  // Kustomisasi tampilan dropdown agar menyatu dengan UI form
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#fbfbfb',
      borderRadius: '14px',
      borderColor: errors.nationality ? '#dc2626' : '#e0e0e0',
      padding: '0.25rem 0.4rem',
      boxShadow: 'none',
      fontSize: '1rem',
      fontFamily: 'inherit',
      '&:hover': {
        borderColor: errors.nationality ? '#dc2626' : '#cccccc'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#8e8e8e'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '14px',
      overflow: 'hidden',
      zIndex: 10
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#1a1a1a' 
        : state.isFocused 
        ? '#f0f0f0' 
        : 'white',
      color: state.isSelected ? 'white' : '#1a1a1a',
      cursor: 'pointer'
    })
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

          {/* Form Group Nationality / Kewarganegaraan */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="nationality" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Nationality <span className="req">*</span>
            </label>

            <Select
              id="nationality"
              options={countryOptions}
              value={form.nationality}
              onChange={option => set('nationality', option)}
              placeholder="Select nationality..."
              styles={customSelectStyles}
              isSearchable
            />

            {errors.nationality && (
              <span className="error-text" style={{ marginTop: '0.4rem', display: 'block' }}>
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

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

const NATIONALITIES = [
  "Emirati", "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguan", 
  "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", 
  "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", 
  "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", 
  "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", 
  "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", 
  "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", 
  "Dutch", "Ecuadorean", "Egyptian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", 
  "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", 
  "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese", "Haitian", 
  "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", 
  "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani", 
  "Kenyan", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", 
  "Liechtensteiner", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malawian", 
  "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", 
  "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mozambican", 
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", 
  "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian", "Panamanian", 
  "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari", 
  "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "Saudi", 
  "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", 
  "Slovak", "Slovenian", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", 
  "Sudanese", "Surinamese", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", 
  "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan", 
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbek", "Vanuatu", "Venezuelan", "Vietnamese", 
  "Welsh", "Yemeni", "Zambian", "Zimbabwean"
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
    if (!form.nationality.trim()) e.nationality = 'Please select your nationality'
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

          {/* Nationality Dropdown matching section spacing and proportions */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <div className="chip-group-label" style={{ marginBottom: '0.5rem' }}>
              Nationality <span className="req">*</span>
            </div>

            <select
              id="nationality"
              value={form.nationality}
              onChange={e => set('nationality', e.target.value)}
              className={`form-input ${errors.nationality ? 'is-invalid' : ''}`}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                fontSize: '0.95rem',
                color: form.nationality ? '#1a1a1a' : '#9ca3af',
                backgroundColor: '#f7f7f8',
                border: errors.nationality ? '1px solid #dc2626' : '1px solid #e2e8f0',
                borderRadius: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%3a6b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1.25rem center',
                backgroundSize: '0.9em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="" disabled hidden>
                Emiratis
              </option>
              {NATIONALITIES.map(nat => (
                <option key={nat} value={nat} style={{ color: '#1a1a1a' }}>
                  {nat}
                </option>
              ))}
            </select>

            {errors.nationality && (
              <span className="error-text" style={{ marginTop: '0.35rem', display: 'block' }}>
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

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
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Antiguans", "Argentinean", 
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", 
  "Barbadian", "Barbudans", "Batswana", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", 
  "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", 
  "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", 
  "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", 
  "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "Dutchman", "Dutchwoman", 
  "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", 
  "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", 
  "Greek", "Grenadian", "Guatemalan", "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", 
  "Herzegovinian", "Honduran", "Hungarian", "I-Kiribati", "Icelander", "Indian", "Indonesian", 
  "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", 
  "Kazakhstani", "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", 
  "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", 
  "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian", "Maltese", "Marshallese", "Mauritanian", 
  "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mosotho", 
  "Motswana", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Ni-Vanuatu", 
  "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Northern Irish", "Norwegian", "Omani", 
  "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", 
  "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", 
  "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", 
  "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Solomon Islander", "Somali", 
  "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", 
  "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", 
  "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "UkrainianHere is the complete `WatcherStep2.jsx` code incorporating the custom styled nationality select dropdown (using native `<select>`) to replace the text input while preserving your exact visual layout and validation logic:

```jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { countries } from 'countries-list'
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

// Generate sorted array of country names from countries-list
const NATIONALITY_OPTIONS = Object.values(countries)
  .map(country => country.name)
  .sort((a, b) => a.localeCompare(b))

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
    <PageShell badge="Registration Open" desc="Register your interest for the next edition of Pitch Them Perfect. Whether you're here to take the mic or watch the magic happen, we want to hear from you." step="{2}" tagline="Think they're the one? Prove it." title="Pitch Them Perfect">
      <BackButton to="/registration"/>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
        <FormCard number="2" title="Audience Details">
          <ChipGroup label="Are you?" onChange="{v" options="{GENDER_OPTIONS}" value="{form.gender}"> set('gender', v)}
            required
            error={errors.gender}
          />

          <ChipGroup label="Age Category" onChange="{v" options="{AGE_OPTIONS}" value="{form.age}"> set('age', v)}
            required
            error={errors.age}
          />

          {/* Nationality Dropdown styled matching design system */}
          <div className="form-group" style={{ marginTop: '1.75rem' }}>
            <label 
              htmlFor="nationality" 
              className="chip-group-label"
              style={{ marginBottom: '0.6rem', display: 'block' }}
            >
              Nationality <span className="req">*</span>
            </label>

            <select
              id="nationality"
              value={form.nationality}
              onChange={e => set('nationality', e.target.value)}
              className={`form-input ${errors.nationality ? 'is-invalid' : ''}`}
              style={{
                width: '100%',
                padding: '0.875rem 1.25rem',
                fontSize: '1rem',
                color: form.nationality ? '#1a1a1a' : '#9ca3af',
                backgroundColor: '#fbfbfb',
                border: errors.nationality ? '1px solid #dc2626' : '1px solid #e0e0e0',
                borderRadius: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)' viewBox='0 0 24 24' fill='none' stroke='%3a6b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1.25rem center',
                backgroundSize: '1em',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
            >
              <option value="" disabled hidden>
                Emiratis
              </option>
              {NATIONALITY_OPTIONS.map(nat => (
                <option key={nat} value={nat} style={{ color: '#1a1a1a' }}>
                  {nat}
                </option>
              ))}
            </select>

            {errors.nationality && (
              <span className="error-text" style={{ marginTop: '0.4rem', display: 'block' }}>
                {errors.nationality}
              </span>
            )}
          </div>
        </FormCard>

        <ConsentCheckbox checked="{form.consent}" id="watcher-consent" onChange="{v"> set('consent', v)}
          error={errors.consent}
        >
          I'm happy for Pitch Them Perfect to contact me via WhatsApp and email about this event and future editions. <span className="req">*</span>
        </ConsentCheckbox>

        <div className="submit-wrapper">
          {showErrorBanner && <ErrorBanner/>}
          <button id="btn-proceed" type="submit" className="btn-primary">
            Proceed to Payment
          </button>
        </div>
      </form>
    </PageShell>
  )
}

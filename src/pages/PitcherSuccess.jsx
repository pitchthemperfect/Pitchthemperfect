import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { useEffect } from 'react'
import { trackPurchase } from '../lib/tracking'

const SuccessCheckIcon = () => (
  <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#FFF0F4"/>
    <circle cx="24" cy="24" r="18" stroke="#E8386D" strokeWidth="3" fill="none"/>
    <path d="M17 24l5 5 10-10" stroke="#E8386D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SparkleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#E8386D' }}>
    <path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
  </svg>
)

export default function PitcherSuccess() {
  const navigate = useNavigate()

  useEffect(() => { trackPurchase({ role: 'pitcher' }) }, [])

  const handleSubmitAnother = () => {
    sessionStorage.removeItem('ptp_pitcher2')
    navigate('/')
  }

  return (
    <PageShell
      badge="Registration Open"
      title="Pitch Them Perfect"
      tagline="Think they're the one? Prove it."
    >
      <div className="form-card" style={{ alignItems: 'center', textAlign: 'center', gap: 16, padding: '40px 24px' }}>
        <SuccessCheckIcon />
        <SparkleIcon />
        <h2 className="success-title">You’re in the running!</h2>
        <p className="success-body" style={{ margin: '0 auto', maxWidth: 320 }}>
          Your pitch has officially entered the chat. Our team will review every submission
          carefully. If selected, we'll be in touch with next steps and event details.
        </p>
        <button
          id="btn-submit-another"
          type="button"
          className="btn-submit-another"
          onClick={handleSubmitAnother}
          style={{ marginTop: 8 }}
        >
          Submit Another Response
        </button>
      </div>
    </PageShell>
  )
}

import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import PageShell from '../components/PageShell'
import { trackLead } from '../lib/tracking'

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#FFF5F8"/>
    <circle cx="24" cy="24" r="18" stroke="#E8386D" strokeWidth="3" fill="none"/>
    <path d="M24 14v10l6 6" stroke="#E8386D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function WaitlistSuccess() {
  const navigate = useNavigate()
  useEffect(() => { trackLead({ role: 'waitlist' }) }, [])

  return (
    <PageShell
      badge="You're on the list"
      title="Pitch Them Perfect"
      tagline="Think they're the one? Prove it."
    >
      <div className="form-card" style={{ alignItems: 'center', textAlign: 'center', gap: 16, padding: '40px 24px' }}>
        <ClockIcon />
        <h2 className="success-title">You're on the waitlist!</h2>
        <p className="success-body" style={{ margin: '0 auto', maxWidth: 320 }}>
          This category is fully booked right now, but we've saved your details.
          If spots open up, we'll reach out to you first — no payment needed until then.
        </p>

        <div style={{
          width: '100%',
          maxWidth: 300,
          background: '#FFF5F8',
          border: '1.5px solid #FCD4E0',
          borderRadius: 12,
          padding: '16px 18px',
          marginTop: 8,
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#E8386D', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What happens next</p>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>We'll notify you by email & WhatsApp if a spot opens.</li>
            <li style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>You'll get priority access before we open to the public.</li>
            <li style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>No commitment — you only pay when you confirm.</li>
          </ul>
        </div>

        <button
          type="button"
          className="btn-submit-another"
          onClick={() => navigate('/')}
          style={{ marginTop: 8 }}
        >
          ← Back to Home
        </button>
      </div>
    </PageShell>
  )
}

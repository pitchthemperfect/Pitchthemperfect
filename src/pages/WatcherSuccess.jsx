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

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const CocktailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12l-6 8z" />
    <line x1="12" x2="12" y1="11" y2="19" />
    <line x1="8" x2="16" y1="19" y2="19" />
  </svg>
)

const HangerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3c0 .8-.5 1.5-1.2 1.8L21 17a1 1 0 0 1-.8 1.5H3.8A1 1 0 0 1 3 17l7.2-10.2c-.7-.3-1.2-1-1.2-1.8a3 3 0 0 1 3-3z" />
  </svg>
)

export default function WatcherSuccess() {
  useEffect(() => { trackPurchase({ role: 'watcher' }) }, [])
  return (
    <PageShell
      badge="You're In!"
      title="Secure Your Watcher Spot"
      titleNormal
      tagline="Join us as part of the Pitch Them Perfect audience."
    >
      <div className="form-card" style={{ alignItems: 'center', textAlign: 'center', gap: 16, padding: '40px 24px' }}>
        <SuccessCheckIcon />
        <SparkleIcon />
        <h2 className="success-title">You're all set!</h2>
        <p className="success-body" style={{ margin: '0 auto', maxWidth: 320 }}>
          Your spot is secured. A confirmation has been sent to your email and WhatsApp.
          Get ready for a night of real pitches, real people, and real connections.
        </p>
      </div>
    </PageShell>
  )
}

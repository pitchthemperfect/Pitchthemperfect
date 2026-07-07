import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import BackButton from '../components/BackButton'
import { supabase } from '../utils/supabaseClient'
import { trackCompleteRegistration, trackBeginCheckout } from '../lib/tracking'
import { getActiveEventId } from '../lib/event'

const MicOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
)

const PeopleOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CocktailOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M6 3h12l-6 8z" />
    <line x1="12" x2="12" y1="11" y2="19" />
    <line x1="8" x2="16" y1="19" y2="19" />
  </svg>
)

const SparklesOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 3c0 4.5-4.5 9-9 9 4.5 0 9 4.5 9 9 0-4.5 4.5-9 9-9-4.5 0-9-4.5-9-9z" />
  </svg>
)

const INCLUDED = [
  { icon: <MicOutlineIcon />, title: 'Nominate & Pitch Live', desc: 'Present your single friend live on stage to a curated room of potential matches.' },
  { icon: <PeopleOutlineIcon />, title: 'Full Entry for Both', desc: 'Your ticket covers entry for both you (the Pitcher) and your single friend (the Pitchee).' },
  { icon: <CocktailOutlineIcon />, title: 'Drinks Included', desc: 'Includes 2 complimentary drink vouchers (one for each of you), redeemable on the night.' },
  { icon: <SparklesOutlineIcon />, title: 'Matchmaking Support', desc: 'Dedicated support during the social hour to help your friend connect with interested matches.' },
]

const SUPABASE_URL = 'https://tnohztvpuflwkltkbphg.supabase.co'

export default function PitcherPayment() {
  const navigate = useNavigate()
  const [ticketPrice, setTicketPrice] = useState('310.00')
  const [embeddedUrl, setEmbeddedUrl] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paying, setPaying] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    trackBeginCheckout({ role: 'pitcher' })
    const fetchSettings = async () => {
      try {
        const { data: priceData } = await supabase.from('settings').select('value').eq('key', 'pitcher_price').single()
        if (priceData?.value) setTicketPrice(priceData.value)
      } catch (_) {}
    }
    fetchSettings()
  }, [])

  const handlePayClick = async () => {
    if (registered) return // Already registered
    setPaying(true)

    try {
      const step1 = JSON.parse(sessionStorage.getItem('ptp_step1') || '{}')
      const step2 = JSON.parse(sessionStorage.getItem('ptp_pitcher2') || '{}')

      if (step1.name) {
        const eventId = await getActiveEventId()
        const { error, data: inserted } = await supabase.from('registrations').insert({
          name: step1.name, whatsapp: step1.phone || '', email: step1.email,
          role: 'pitcher', relationship: step2.relationship || '', pitchee_gender: step2.pitcheeGender || '',
          instagram: step2.instagram || '', their_name: step2.theirName || '', can_attend: step2.canAttend || '',
          pitch: step2.pitch || '', status: 'pending', amount: `AED ${ticketPrice}`,
          links: step2.links || '', event_id: eventId,
        }).select('id').single()

        if (error) throw error
        setRegistered(true)
        trackCompleteRegistration({ role: 'pitcher' })

        // Create Ziina payment via Edge Function
        if (SUPABASE_URL) {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: ticketPrice, role: 'pitcher', registration_id: inserted?.id }),
          })
          const ziina = await res.json()
          if (ziina.embedded_url) {
            setEmbeddedUrl(ziina.embedded_url)
            setPaymentId(ziina.id)
            // Link payment to registration
            if (inserted?.id && ziina.id) {
              supabase.from('registrations').update({ ziina_payment_id: ziina.id }).eq('id', inserted.id).then(() => {})
            }
            setPaying(false)
            return
          }
        }

        // Fallback: no Edge Function available
        navigate('/register/pitcher/success')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setPaying(false)
    }
  }

  // After iframe closes / payment done, navigate to success
  useEffect(() => {
    if (!embeddedUrl) return
    // Ziina doesn't support iframe embedding — open in new tab
    const w = window.open(embeddedUrl.replace('/embedded', ''), '_blank')
    if (!w) {
      // Popup blocked, fallback to redirect
      window.location.href = embeddedUrl.replace('/embedded', '')
    } else {
      navigate('/register/pitcher/success')
    }
  }, [embeddedUrl, navigate])

  if (embeddedUrl) {
    // Payment opened in new tab — shown fallback message
    return (
      <PageShell badge="Payment Opened" title="Complete Your Payment" titleNormal tagline="A payment window has been opened. Complete your payment there, then close this page.">
        <div className="price-card">
          <p className="price-amount" style={{ fontSize: 48 }}>💳</p>
          <p style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            Payment opened in a new tab. Once complete, you can close this window.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ background: '#FFF', color: '#E8386D', border: '2px solid #E8386D' }}>
            Back to Home
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      badge="Almost There"
      title="Secure Your Pitcher Spot"
      titleNormal
      tagline="Nominate a friend and take the stage at Pitch Them Perfect."
    >
      <BackButton to="/register/pitcher" />

      <FormCard>
        <p className="included-label">What's Included</p>
        <div className="included-list">
          {INCLUDED.map(item => (
            <div key={item.title} className="included-item">
              <div className="included-icon">{item.icon}</div>
              <div className="included-content">
                <p className="included-title">{item.title}</p>
                <p className="included-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      <div className="price-card">
        <p className="price-eyebrow">Ticket Price</p>
        <p className="price-amount"><span>AED</span>{ticketPrice}</p>
        <button id="btn-pay-now" className="btn-primary" onClick={handlePayClick} disabled={paying}>
          {paying ? 'Creating payment...' : 'Pay Now \u00A0→'}
        </button>
        <p className="price-secure">🔒 Secure payment via Ziina</p>
      </div>
    </PageShell>
  )
}

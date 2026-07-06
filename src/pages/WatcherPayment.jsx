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

const CocktailOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M6 3h12l-6 8z" />
    <line x1="12" x2="12" y1="11" y2="19" />
    <line x1="8" x2="16" y1="19" y2="19" />
  </svg>
)

const HeartOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const SparklesOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8386D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 3c0 4.5-4.5 9-9 9 4.5 0 9 4.5 9 9 0-4.5 4.5-9 9-9-4.5 0-9-4.5-9-9z" />
  </svg>
)

const INCLUDED = [
  { icon: <MicOutlineIcon />, title: 'Live Pitches', desc: 'Friends roast (and rave) about their single friends — live on stage.' },
  { icon: <CocktailOutlineIcon />, title: 'Drinks & Vibes', desc: 'A proper night out with great energy and even better people. Includes 1 complimentary drink voucher, redeemable on the night.' },
  { icon: <HeartOutlineIcon />, title: 'Real Connections', desc: 'Meet people who were actually curated and vouched for.' },
  { icon: <SparklesOutlineIcon />, title: 'No Apps. No Swiping.', desc: 'Just real humans in a real room doing real romance.' },
]

const SUPABASE_URL = 'https://tnohztvpuflwkltkbphg.supabase.co'

export default function WatcherPayment() {
  const navigate = useNavigate()
  const [ticketPrice, setTicketPrice] = useState('181.00')
  const [embeddedUrl, setEmbeddedUrl] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [paying, setPaying] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    trackBeginCheckout({ role: 'watcher' })
    const fetchSettings = async () => {
      try {
        const { data: priceData } = await supabase.from('settings').select('value').eq('key', 'watcher_price').single()
        if (priceData?.value) setTicketPrice(priceData.value)
      } catch (_) {}
    }
    fetchSettings()
  }, [])

  const handlePayClick = async () => {
    if (registered) return
    setPaying(true)

    try {
      const step1 = JSON.parse(sessionStorage.getItem('ptp_step1') || '{}')
      const step2 = JSON.parse(sessionStorage.getItem('ptp_watcher2') || '{}')

      if (step1.name) {
        const eventId = await getActiveEventId()
        const { error, data: inserted } = await supabase.from('registrations').insert({
          name: step1.name, whatsapp: step1.phone || '', email: step1.email,
          role: 'watcher', gender: step2.gender || '', age_group: step2.age || '',
          status: 'pending', amount: `AED ${ticketPrice}`, event_id: eventId,
        }).select('id').single()

        if (error) throw error
        setRegistered(true)
        trackCompleteRegistration({ role: 'watcher' })

        if (SUPABASE_URL) {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: ticketPrice, role: 'watcher', registration_id: inserted?.id }),
          })
          const ziina = await res.json()
          if (ziina.embedded_url) {
            setEmbeddedUrl(ziina.embedded_url)
            setPaymentId(ziina.id)
            if (inserted?.id && ziina.id) {
              supabase.from('registrations').update({ ziina_payment_id: ziina.id }).eq('id', inserted.id).then(() => {})
            }
            setPaying(false)
            return
          }
        }

        navigate('/success/watcher')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setPaying(false)
    }
  }

  useEffect(() => {
    if (!embeddedUrl) return
    // Ziina doesn't support iframe embedding — open in new tab
    const w = window.open(embeddedUrl.replace('/embedded', ''), '_blank')
    if (!w) {
      window.location.href = embeddedUrl.replace('/embedded', '')
    } else {
      navigate('/success/watcher')
    }
  }, [embeddedUrl, navigate])

  if (embeddedUrl) {
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
      title="Secure Your Watcher Spot"
      titleNormal
      tagline="Join us as part of the Pitch Them Perfect audience."
    >
      <BackButton to="/register/watcher" />

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

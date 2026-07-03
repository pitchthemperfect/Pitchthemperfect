import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell'
import FormCard from '../components/FormCard'
import BackButton from '../components/BackButton'
import { supabase } from '../utils/supabaseClient'

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
  { 
    icon: <MicOutlineIcon />, 
    title: 'Nominate & Pitch Live',       
    desc: 'Present your single friend live on stage to a curated room of potential matches.' 
  },
  { 
    icon: <PeopleOutlineIcon />, 
    title: 'Full Entry for Both',     
    desc: 'Your ticket covers entry for both you (the Pitcher) and your single friend (the Pitchee).' 
  },
  { 
    icon: <CocktailOutlineIcon />, 
    title: 'Drinks Included',   
    desc: 'Includes 2 complimentary drink vouchers (one for each of you), redeemable on the night.' 
  },
  { 
    icon: <SparklesOutlineIcon />, 
    title: 'Matchmaking Support', 
    desc: 'Dedicated support during the social hour to help your friend connect with interested matches.' 
  },
]

export default function PitcherPayment() {
  const navigate = useNavigate()
  const [ticketPrice, setTicketPrice] = useState('310.00')
  const [paymentUrl, setPaymentUrl] = useState('https://pay.ziina.com/dvlp/gF9JPnd3e?source=app')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: priceData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'pitcher_price')
          .single()
        if (priceData && priceData.value) {
          setTicketPrice(priceData.value)
        }

        const { data: urlData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'pitcher_payment_url')
          .single()
        if (urlData && urlData.value) {
          setPaymentUrl(urlData.value)
        }
      } catch (err) {
        console.error('Error fetching pitcher settings from Supabase:', err)
      }
    }
    fetchSettings()
  }, [])

  const handlePayClick = async () => {
    try {
      const step1 = JSON.parse(sessionStorage.getItem('ptp_step1') || '{}')
      const step2 = JSON.parse(sessionStorage.getItem('ptp_pitcher2') || '{}')
      
      if (step1.name) {
        // TODO: After Ziina Edge Function is live, change status to 'pending'
        // and let the webhook update it to 'confirmed' upon payment verification.
        const { error } = await supabase.from('registrations').insert({
          name: step1.name,
          whatsapp: step1.phone || '',
          email: step1.email,
          role: 'pitcher',
          relationship: step2.relationship || '',
          pitchee_gender: step2.pitcheeGender || '',
          instagram: step2.instagram || '',
          their_name: step2.theirName || '',
          can_attend: step2.canAttend || '',
          pitch: step2.pitch || '',
          status: 'pitch',
          amount: `AED ${ticketPrice}`,
          links: step2.links || ''
        })
        if (error) {
          console.error('Supabase error inserting pitcher:', error)
        }
      }
    } catch (err) {
      console.error('Error saving pitcher registration to Supabase:', err)
    }

    setTimeout(() => {
      navigate('/register/pitcher/success')
    }, 150)
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
        <a 
          id="btn-pay-now" 
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary" 
          onClick={handlePayClick}
          style={{ textDecoration: 'none' }}
        >
          Pay Now &nbsp;→
        </a>
        <p className="price-secure">
          🔒 Secure payment via Ziina
        </p>
      </div>
    </PageShell>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { trackLead } from '../lib/tracking'

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
  </svg>
)

const PEOPLE = [
  { icon: '🎤', title: 'Nominate', desc: 'Friends take the mic to pitch their single friend — real stories, real chemistry.' },
  { icon: '👁️', title: 'Watch & Vote', desc: 'The crowd watches live pitches and votes on who they\'d match with.' },
  { icon: '💌', title: 'Connect', desc: 'After the show, matches are revealed. No apps. No swiping. Just real people.' },
]

const FAQ = [
  { q: 'What is Pitch Them Perfect?', a: 'A live matchmaking night where friends go on stage to pitch their single friends to a room of curated singles.' },
  { q: 'Who can pitch?', a: 'Anyone with a single friend they genuinely believe in. Our team reviews every nomination and selects the best pitches.' },
  { q: 'Can I just come watch?', a: 'Absolutely. Buy a watcher ticket, show up, enjoy the show, and meet people — no pressure to go on stage.' },
  { q: 'Is there a dress code?', a: 'Smart casual. Come looking your best — the room will be full of eligible people.' },
  { q: 'How are matches made?', a: 'After every pitch, the audience votes on who they\'d like to meet. Matches are revealed during the social hour.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [gallery, setGallery] = useState({ g1: '', g2: '', g3: '', g4: '' })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['event_date', 'event_location', 'gallery_photo_1', 'gallery_photo_2', 'gallery_photo_3', 'gallery_photo_4'])
        if (data) {
          const get = (k) => data.find(s => s.key === k)?.value || ''
          setEventDate(get('event_date'))
          setEventLocation(get('event_location'))
          setGallery({
            g1: get('gallery_photo_1'),
            g2: get('gallery_photo_2'),
            g3: get('gallery_photo_3'),
            g4: get('gallery_photo_4'),
          })
        }
      } catch (_) {}
    }
    fetchSettings()
  }, [])

  const goToRegister = (role) => {
    trackLead({ role })
    sessionStorage.setItem('ptp_role', role)
    navigate('/registration')
  }

  return (
    <div className="landing-page">
      <div className="landing-inner">
        {/* ─── Hero ─── */}
        <section className="landing-hero-section">
          <div className="landing-hero-badge">
            <HeartIcon />
            <span>Dubai's Live Matchmaking Show</span>
          </div>

          <h1 className="landing-hero-title">
            Pitch Them<br />Perfect
          </h1>

          <p className="landing-hero-tagline">
            Think they're the one? <span>Prove it.</span>
          </p>

          <p className="landing-hero-desc">
            One night. One stage. Real friends pitching their single friends
            to a room full of people who actually showed up to meet someone.
            No algorithms. No swiping. Just real human chemistry.
          </p>

          {/* Event info moved here — above CTAs */}
          <div className="landing-hero-event-info">
            {eventDate && <span><CalendarIcon /> {eventDate}</span>}
            {eventDate && eventLocation && <span className="hero-event-divider">·</span>}
            {eventLocation && <span><MapPinIcon /> {eventLocation}</span>}
            <span className="hero-event-divider">·</span>
            <span className="hero-event-tickets">Tickets from AED 181</span>
          </div>

          {/* CTAs */}
          <div className="landing-hero-ctas">
            <button className="landing-cta-primary" onClick={() => goToRegister('pitcher')}>
              <MicIcon />
              Bring Someone to Pitch
            </button>
            <button className="landing-cta-secondary-btn" onClick={() => goToRegister('watcher')}>
              <EyeIcon />
              Come Watch
            </button>
          </div>

          <p className="landing-hero-note">
            Pitcher submissions are reviewed. Watcher tickets are first-come, first-served.
          </p>
        </section>

        {/* ─── How it works ─── */}
        <section className="landing-how-section">
          <p className="landing-section-eyebrow">How It Works</p>
          <h2 className="landing-section-title">Three steps to matchmaking magic</h2>

          <div className="landing-how-cards">
            {PEOPLE.map((step, i) => (
              <div key={step.title} className="landing-how-card">
                <div className="landing-how-step">{String(i + 1).padStart(2, '0')}</div>
                <div className="landing-how-icon">{step.icon}</div>
                <h3 className="landing-how-title">{step.title}</h3>
                <p className="landing-how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Gallery / vibe ─── */}
        <section className="landing-gallery-section">
          <p className="landing-section-eyebrow">The Vibe</p>
          <h2 className="landing-section-title">What to expect on the night</h2>

          <div className="landing-gallery-grid">
            <div className={`landing-gallery-card gallery-card-main${gallery.g1 ? ' has-photo' : ''}`}>
              <div className="gallery-card-inner">
                {gallery.g1 ? (
                  <img src={gallery.g1} alt="Live pitch on stage" className="gallery-photo" />
                ) : (
                  <>
                    <span className="gallery-emoji">🎤</span>
                    <p className="gallery-label">Live Pitches</p>
                  </>
                )}
              </div>
            </div>
            <div className={`landing-gallery-card${gallery.g2 ? ' has-photo' : ''}`}>
              <div className="gallery-card-inner">
                {gallery.g2 ? (
                  <img src={gallery.g2} alt="Drinks and social" className="gallery-photo" />
                ) : (
                  <>
                    <span className="gallery-emoji">🥂</span>
                    <p className="gallery-label">Drinks & Social</p>
                  </>
                )}
              </div>
            </div>
            <div className={`landing-gallery-card${gallery.g3 ? ' has-photo' : ''}`}>
              <div className="gallery-card-inner">
                {gallery.g3 ? (
                  <img src={gallery.g3} alt="Real connections" className="gallery-photo" />
                ) : (
                  <>
                    <span className="gallery-emoji">💫</span>
                    <p className="gallery-label">Real Matches</p>
                  </>
                )}
              </div>
            </div>
            <div className={`landing-gallery-card gallery-card-wide${gallery.g4 ? ' has-photo' : ''}`}>
              <div className="gallery-card-inner">
                {gallery.g4 ? (
                  <img src={gallery.g4} alt="Curated crowd" className="gallery-photo" />
                ) : (
                  <>
                    <span className="gallery-emoji">✨</span>
                    <p className="gallery-label">Curated Crowd</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Stats / social proof ─── */}
        <section className="landing-stats-section">
          <div className="landing-stat">
            <span className="landing-stat-num">80+</span>
            <span className="landing-stat-label">Guests per show</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">10</span>
            <span className="landing-stat-label">Live pitches</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">60%</span>
            <span className="landing-stat-label">Match rate</span>
          </div>
        </section>

        {/* ─── CTA repeat ─── */}
        <section className="landing-cta-section">
          <div className="landing-cta-card">
            <SparkleIcon />
            <h2 className="landing-cta-card-title">Ready to join the room?</h2>
            <p className="landing-cta-card-desc">
              Whether you're pitching a friend or just here for the show — 
              this is the most fun you'll have on a night out in Dubai.
            </p>
            <div className="landing-cta-card-buttons">
              <button className="landing-cta-primary" onClick={() => goToRegister('pitcher')}>
                <MicIcon /> Pitch a Friend
              </button>
              <button className="landing-cta-secondary-btn" onClick={() => goToRegister('watcher')}>
                <EyeIcon /> Get Watcher Ticket
              </button>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="landing-faq-section">
          <p className="landing-section-eyebrow">FAQ</p>
          <h2 className="landing-section-title">You might be wondering</h2>

          <div className="landing-faq-list">
            {FAQ.map((item, i) => (
              <details key={i} className="landing-faq-item">
                <summary className="landing-faq-q">{item.q}</summary>
                <p className="landing-faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="landing-footer">
          <p className="landing-footer-brand">
            <HeartIcon /> Pitch Them Perfect
          </p>
          <p className="landing-footer-copy">
            Real people. Real room. No apps. No swiping.
          </p>
        </footer>
      </div>
    </div>
  )
}

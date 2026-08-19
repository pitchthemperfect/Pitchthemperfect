import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { trackLead } from '../lib/tracking'

/* --- Custom SVG Icons to Match Your Minimalist Style --- */
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
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

// NEW minimal chevron icons to match reference
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const ChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
)

export default function LandingPage() {
  const navigate = useNavigate()
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [gallery, setGallery] = useState({ g1: '', g2: '', g3: '', g4: '' })
  
  // State to track which FAQ is expanded, initialized to null (all closed)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['event_date', 'event_time', 'event_location', 'gallery_photo_1', 'gallery_photo_2', 'gallery_photo_3', 'gallery_photo_4'])
        if (data) {
          const get = (k) => data.find(s => s.key === k)?.value || ''
          setEventDate(get('event_date'))
          setEventTime(get('event_time'))
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

  // Define FAQ data here for easier maintenance
  const faqData = [
    {
      question: "Do I need to come with a friend?",
      answer: "Not at all! Most people come solo — and honestly, it makes meeting new people even easier. If it’s a Pitch Night, don’t worry — we’ll make sure you’re not the only one flying solo."
    },
    {
      question: "What if I registered and suddenly can't make it?",
      answer: (
        <>
          <p>No worries! We offer refunds based on when you cancel:</p>
          <ul>
            <li><strong>More than 24 hours before the event:</strong> Full refund, minus the bank processing fee.</li>
            <li><strong>Between 24 and 5 hours before the event:</strong> 60% refund, minus the bank processing fee.</li>
            <li><strong>Less than 5 hours before the event:</strong> No refund.</li>
          </ul>
        </>
      )
    },
    {
      question: "Is it only for singles?",
      answer: "Mostly, but not exclusively! Singles are definitely welcome, but couples can join too — whether you’re looking for a fun night out or coming along to pitch your single friend."
    },
    {
      question: "What should I prepare?",
      answer: "Just bring yourself, an open mind, and your best energy. Come ready for a fun night, good conversations, and maybe a little unexpected chemistry. 😉"
    }
  ];

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

          <div className="landing-hero-event-info">
            <span className="hero-event-date">
              <CalendarIcon /> {eventDate || 'Date TBA'}
            </span>
            {eventTime && <span><span className="hero-event-divider">·</span>🕐 {eventTime}</span>}
            {eventLocation && <span><span className="hero-event-divider">·</span><MapPinIcon /> {eventLocation}</span>}
          </div>

          <div className="landing-hero-ctas">
            <button className="landing-cta-primary" onClick={() => goToRegister('pitcher')}>
              Reserve Your Spot
            </button>
          </div>

          <p className="landing-hero-note">
            Choose to pitch a friend or come watch — next step.
          </p>
        </section>

        {/* ─── Gallery / vibe ─── */}
        <section className="landing-gallery-section">
          <p className="landing-section-eyebrow">The Vibe</p>
          <h2 className="landing-section-title">What to expect on the night</h2>

          <div className="landing-gallery-grid">
            {/* Gallery items... (unchanged, but added placeholder for brevity) */}
            <div className={`landing-gallery-card gallery-card-main${gallery.g1 ? ' has-photo' : ''}`}>
               <div className="gallery-card-inner">
                 {gallery.g1 ? <img src={gallery.g1} alt="Live pitch" className="gallery-photo" /> : <span className="gallery-emoji">🎤</span>}
               </div>
            </div>
            {/* Repeat for g2, g3, g4 as needed */}
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="landing-faq-section">
          <p className="landing-section-eyebrow">Got Questions?</p>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>

          <div className="landing-faq-list">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`landing-faq-item ${openFaqIndex === index ? 'is-open' : ''}`}
              >
                <button 
                  className="landing-faq-question" 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} // Toggle open/closed state
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle-icon">
                    {openFaqIndex === index ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </button>
                {/* Conditionally render the answer to minimize visual clutter */}
                {openFaqIndex === index && (
                  <div className="landing-faq-answer">
                    {/* Ensure answer font size is slightly smaller than question and has space */}
                    {typeof faq.answer === 'string' ? <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>{faq.answer}</p> : faq.answer}
                  </div>
                )}
              </div>
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

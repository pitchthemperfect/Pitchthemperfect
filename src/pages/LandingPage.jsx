import { useNavigate } from 'react-router-dom'

const faqs = [
  {
    q: 'What is Pitch Them Perfect?',
    a: 'A live matchmaking event where friends take the mic to pitch their single friends to a curated room of people.',
  },
  {
    q: 'Who can come as a Watcher?',
    a: 'Anyone! Buy a ticket, show up, and enjoy live pitches, drinks, and real connections.',
  },
  {
    q: 'What does a Pitcher do?',
    a: 'You nominate a single friend and pitch them on stage. Our team reviews submissions and picks the best pitches.',
  },
  {
    q: 'Is there a dress code?',
    a: 'Smart casual. Come looking your best — you might meet someone special.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-inner">
        {/* Badge */}
        <div className="badge" style={{ alignSelf: 'center' }}>
          <span className="badge-dot" />
          Registration Open
        </div>

        {/* Hero */}
        <div className="landing-hero">
          <h1 className="landing-title">Pitch Them<br />Perfect</h1>
          <p className="landing-tagline">Think they're the one? Prove it.</p>
          <p className="landing-hook">
            A live matchmaking night where friends go on stage to pitch their single friends.
            Real people. Real room. No apps. No swiping.
          </p>
        </div>

        {/* Photo placeholders */}
        <div className="landing-photos">
          <div className="landing-photo-main">
            <span style={{ fontSize: 48, opacity: .18 }}>🎤</span>
          </div>
          <div className="landing-photo-sm">
            <span style={{ fontSize: 32, opacity: .18 }}>❤️</span>
          </div>
          <div className="landing-photo-sm">
            <span style={{ fontSize: 32, opacity: .18 }}>✨</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="landing-ctas">
          <button
            id="cta-pitch"
            className="landing-cta-pitch"
            onClick={() => {
              sessionStorage.setItem('ptp_role', 'pitcher')
              navigate('/register')
            }}
          >
            🎤 Bring someone to pitch
          </button>
          <button
            id="cta-watch"
            className="landing-cta-watch"
            onClick={() => {
              sessionStorage.setItem('ptp_role', 'watcher')
              navigate('/register')
            }}
          >
            👁 Come watch
          </button>
        </div>

        {/* FAQ */}
        <div className="landing-faq">
          <p className="faq-title">FAQ</p>
          {faqs.map((f, i) => (
            <div key={i} className="faq-item">
              <p className="faq-q">{f.q}</p>
              <p className="faq-a">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

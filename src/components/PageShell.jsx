export default function PageShell({ badge, title, titleNormal, tagline, desc, step, children }) {
  return (
    <div className="page">
      <div className="page-inner">
        {/* Badge */}
        <div className="badge">
          <span className="badge-heart">❤</span>
          {badge}
        </div>

        {/* Header */}
        <div className="page-header">
          {titleNormal
            ? <h1 className="page-title-normal">{title}</h1>
            : <h1 className="page-title">{title}</h1>
          }
          <p className="page-tagline">{tagline}</p>
          {desc && <p className="page-desc">{desc}</p>}
        </div>

        {/* Stepper */}
        {step && (
          <div className="stepper" aria-label={`Step ${step} of 2`}>
            <div className={`step-dot ${step === 1 ? 'active' : 'done'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            <div className={`step-dot ${step === 2 ? 'active' : 'inactive'}`}>2</div>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

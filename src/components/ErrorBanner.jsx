export default function ErrorBanner() {
  return (
    <div className="error-banner" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" fill="#111111"/>
        <path d="M12 7v6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.25" fill="#ffffff"/>
      </svg>
      <span>Please fix the errors above.</span>
    </div>
  )
}

export default function ConsentCheckbox({ id, checked, onChange, children, error }) {
  return (
    <div className="consent-card">
      <label className="consent-label" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="consent-text">{children}</span>
      </label>
      {error && <p className="consent-error">{error}</p>}
    </div>
  )
}

export default function ChipGroup({ label, options, value, onChange, required, error, roleStyle }) {
  return (
    <div className="chip-group-wrap">
      {label && (
        <span className="chip-group-label">
          {label}{required && <span className="req"> *</span>}
        </span>
      )}
      <div className={`chip-group ${roleStyle ? 'role-chip-group' : ''}`} role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`chip ${roleStyle ? 'role-chip' : ''} ${value === opt.value ? 'selected' : ''}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.icon && <span className="role-chip-icon">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
      {error && <span className="chip-error">{error}</span>}
    </div>
  )
}

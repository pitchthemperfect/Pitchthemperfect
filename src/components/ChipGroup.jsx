export default function ChipGroup({ label, options, value, onChange, required, error, roleStyle }) {
  return (
    <div className="chip-group-wrap">
      {label && (
        <span className="chip-group-label">
          {label}{required && <span className="req"> *</span>}
        </span>
      )}
      <div className={`chip-group ${roleStyle ? 'role-chip-group' : ''}`} role="group" aria-label={label}>
        {options.map((opt) => {
          const isSelected = value === opt.value
          const isDisabled = opt.disabled
          return (
            <button
              key={opt.value}
              type="button"
              className={`chip ${roleStyle ? 'role-chip' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onChange(opt.value)}
              aria-pressed={isSelected}
              disabled={isDisabled}
            >
              {opt.icon && <span className="role-chip-icon">{opt.icon}</span>}
              <span className="role-chip-text">
                <span>{opt.label}</span>
                {opt.sub && <span className={`role-chip-sub ${isDisabled ? 'sold-out' : ''}`}>{opt.sub}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {error && <span className="chip-error">{error}</span>}
    </div>
  )
}

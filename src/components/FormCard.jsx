export default function FormCard({ number, title, children }) {
  return (
    <div className="form-card">
      {title && (
        <div className="card-header">
          <span className="card-num">{number}</span>
          <span className="card-title">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

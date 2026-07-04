/**
 * Print-friendly QR code page.
 * Generates QR codes for each table that guests scan to submit live story cards.
 * Just print this page (Ctrl+P) and place one QR per table.
 */

const TABLE_COUNT = 60

function QRCode({ table }) {
  const url = `https://pitch-them-perfect.vercel.app/live?t=${table}`
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '12px 8px', pageBreakInside: 'avoid'
    }}>
      <img src={qr} alt={`Table ${table}`} width={100} height={100}
        style={{ display: 'block' }} />
      <span style={{ fontSize: 16, fontWeight: 800, color: '#E8386D' }}>Table {table}</span>
      <span style={{ fontSize: 9, color: '#CCC', textAlign: 'center', maxWidth: 120 }}>
        Scan to submit a live story card
      </span>
    </div>
  )
}

export default function QRPage() {
  const tables = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1)

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      background: '#fff',
      minHeight: '100dvh'
    }}>
      <div style={{
        textAlign: 'center', marginBottom: 24,
        paddingBottom: 16, borderBottom: '2px dashed #FCD4E0'
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#111', margin: 0, textTransform: 'uppercase' }}>
          Pitch Them Perfect
        </h1>
        <p style={{ fontSize: 13, color: '#999', margin: '4px 0' }}>
          Live Story Cards — Print & place one QR per table
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '8px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {tables.map(t => <QRCode key={t} table={t} />)}
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

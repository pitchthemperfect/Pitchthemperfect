import React, { useState } from 'react';

export default function RegistrationAdminApp() {
  // --- Form & Data States ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'watcher',
    nationality: '',
    details: '',
    pitch: ''
  });

  const [registrations, setRegistrations] = useState([
    {
      id: 'REG-101',
      name: 'Sarah Ahmed',
      email: 'sarah@example.com',
      role: 'pitcher',
      nationality: 'Emirati',
      details: 'Founder of TechFlow, looking for seed investment.',
      pitch: 'An AI platform that automates cross-border logistics workflow.',
      status: 'pending',
      attended: false,
      createdAt: '2026-08-18'
    },
    {
      id: 'REG-102',
      name: 'Mark Davis',
      email: 'mark.davis@example.com',
      role: 'watcher',
      nationality: 'British',
      details: 'Angel Investor exploring early-stage AI startups.',
      pitch: '',
      status: 'paid',
      attended: true,
      createdAt: '2026-08-19'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `REG-${Math.floor(100 + Math.random() * 900)}`,
      ...formData,
      status: 'pending',
      attended: false,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setRegistrations(prev => [newEntry, ...prev]);
    setFormData({
      name: '',
      email: '',
      role: 'watcher',
      nationality: '',
      details: '',
      pitch: ''
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setRegistrations(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleToggleAttended = (id, currentVal) => {
    setRegistrations(prev =>
      prev.map(item => (item.id === id ? { ...item, attended: !currentVal } : item))
    );
  };

  const handleConfirmPayment = (row) => {
    handleUpdateStatus(row.id, 'paid');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      setRegistrations(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Role', 'Nationality', 'Details', 'Pitch', 'Status', 'Attended', 'Created At'];
    
    const csvRows = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${row.id || ''}"`,
        `"${(row.name || '').replace(/"/g, '""')}"`,
        `"${(row.email || '').replace(/"/g, '""')}"`,
        `"${row.role || ''}"`,
        `"${(row.nationality || '').replace(/"/g, '""')}"`,
        `"${(row.details || '').replace(/"/g, '""')}"`,
        `"${(row.pitch || '').replace(/"/g, '""')}"`,
        `"${row.status || ''}"`,
        `"${row.attended ? 'Yes' : 'No'}"`,
        `"${row.createdAt || ''}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtering ---
  const filteredData = registrations.filter(item => {
    const matchesRole = filterRole === 'all' || item.role === filterRole;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nationality && item.nationality.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#F8FAFC', minHeight: '100vh', padding: '32px 24px', color: '#1E293B' }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#0F172A' }}>Event Dashboard</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: 14 }}>Manage watcher & pitcher registrations</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            style={{
              padding: '10px 18px', borderRadius: 8, border: 'none',
              background: filteredData.length === 0 ? '#CBD5E1' : '#E8386D',
              color: '#FFF', fontSize: 13, fontWeight: 700, cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer'
            }}>
            📥 Export CSV ({filteredData.length})
          </button>
        </div>

        {/* Form Card */}
        <div style={{ background: '#FFF', padding: 24, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px 0', color: '#0F172A' }}>New Registration</h2>
          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Role *</label>
              <select name="role" value={formData.role} onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#FFF' }}>
                <option value="watcher">👁 Watcher</option>
                <option value="pitcher">🎤 Pitcher</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Name *</label>
              <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Email *</label>
              <input type="email" name="email" required placeholder="email@example.com" value={formData.email} onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Nationality *</label>
              <input type="text" name="nationality" required placeholder="e.g., Emirati, British, Indonesian" value={formData.nationality} onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Details / Background</label>
              <input type="text" name="details" placeholder="Brief intro or company details" value={formData.details} onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {formData.role === 'pitcher' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>Pitch Summary *</label>
                <textarea name="pitch" required placeholder="Describe your pitch line..." value={formData.pitch} onChange={handleInputChange} rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
            )}

            <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
              <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0F172A', color: '#FFF', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Add Registration
              </button>
            </div>
          </form>
        </div>

        {/* Filters & Table Wrapper */}
        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Search by name, email, nationality..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: 260, outline: 'none' }} />

            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pitcher', 'watcher'].map(role => (
                <button key={role} onClick={() => setFilterRole(role)}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer',
                    background: filterRole === role ? '#0F172A' : '#F1F5F9',
                    color: filterRole === role ? '#FFF' : '#475569'
                  }}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
                  <th style={{ padding: '14px 20px' }}>Name</th>
                  <th style={{ padding: '14px 20px' }}>Role</th>
                  <th style={{ padding: '14px 20px' }}>Details</th>
                  <th style={{ padding: '14px 20px' }}>📝 Pitch</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px 20px', textAlign: 'center', color: '#888' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⏳</span> Loading registrations...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '48px 20px', textAlign: 'center' }}>
                      <div style={{ color: '#CBD5E1', fontSize: 48, marginBottom: 12 }}>📭</div>
                      <div style={{ color: '#64748B', fontWeight: 600, fontSize: 14 }}>No registrations found</div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      
                      {/* Name & Email */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.name}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{row.email}</div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12,
                          color: row.role === 'pitcher' ? '#D63B6B' : '#334155'
                        }}>
                          {row.role === 'pitcher' ? '🎤 Pitcher' : '👁 Watcher'}
                        </span>
                      </td>

                      {/* Details & Nationality */}
                      <td style={{ padding: '16px 20px', color: '#334155', maxWidth: 320, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {row.nationality && (
                          <div style={{ marginBottom: 4 }}>
                            <span style={{ display: 'inline-block', background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                              🌍 {row.nationality}
                            </span>
                          </div>
                        )}
                        <div>{row.details || <span style={{ color: '#CBD5E1' }}>No details</span>}</div>
                      </td>

                      {/* Pitch */}
                      <td style={{ padding: '16px 20px', color: '#334155', maxWidth: 280, lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {row.role === 'pitcher' && row.pitch
                          ? <span style={{ color: '#0F172A', fontWeight: 600 }}>"{row.pitch.length > 80 ? row.pitch.slice(0, 80) + '...' : row.pitch}"</span>
                          : <span style={{ color: '#CBD5E1' }}>—</span>
                        }
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        <select value={row.status} onChange={e => handleUpdateStatus(row.id, e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0',
                            fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                            background:
                              row.status === 'paid'      ? '#E8F5E9' :
                              row.status === 'confirmed' ? '#E3F2FD' :
                              row.status === 'pending'   ? '#FFFDE7' :
                              row.status === 'waitlist'  ? '#FFF3E0' :
                              row.status === 'declined'  ? '#FFEBEE' : '#FFF',
                            color:
                              row.status === 'paid'      ? '#2E7D32' :
                              row.status === 'confirmed' ? '#1565C0' :
                              row.status === 'pending'   ? '#F57F17' :
                              row.status === 'waitlist'  ? '#E65100' :
                              row.status === 'declined'  ? '#C62828' : '#555',
                            width: '100%', maxWidth: 120
                          }}>
                          <option value="pending">⏳ Pending</option>
                          <option value="paid">💳 Paid</option>
                          {row.role === 'pitcher' && (
                            <option value="confirmed">✅ Confirmed</option>
                          )}
                          <option value="waitlist">📋 Waitlist</option>
                          <option value="declined">❌ Declined</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {row.status === 'pending' && (
                            <button onClick={() => handleConfirmPayment(row)}
                              style={{
                                padding: '5px 10px', borderRadius: 6, border: '1.5px solid #E8386D',
                                background: '#FFF', color: '#E8386D', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit'
                              }}>💳 Confirm</button>
                          )}
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, color: row.attended ? '#2E7D32' : '#94A3B8' }}>
                            <input type="checkbox" checked={row.attended || false} onChange={() => handleToggleAttended(row.id, row.attended)}
                              style={{ cursor: 'pointer', accentColor: '#E8386D' }} />
                            Attended
                          </label>
                          <button onClick={() => handleDelete(row.id)}
                            style={{
                              padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0',
                              background: '#FFF', color: '#94A3B8', fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit'
                            }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

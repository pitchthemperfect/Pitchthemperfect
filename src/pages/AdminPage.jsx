import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

// Seed mock data for the admin page
const INITIAL_REGISTRATIONS = [
  {
    id: 1,
    name: 'Angelo Widiyanto',
    phone: '088885560001',
    email: 'AngeloXwidiyanto@gmail.com',
    role: 'watcher',
    details: 'Female, 26–30',
    status: 'paid',
    date: '2026-07-03 21:05',
    amount: 'AED 181.00'
  },
  {
    id: 2,
    name: 'Sarah Ahmed',
    phone: '+971 50 123 4567',
    email: 'sarah.ahmed@example.ae',
    role: 'pitcher',
    details: 'Nominated: Faisal, 28 (@faisal_dxb). Friend. Can attend: Yes',
    status: 'pitch',
    date: '2026-07-03 20:30',
    amount: '-'
  },
  {
    id: 3,
    name: 'Michael Chen',
    phone: '+971 52 876 5432',
    email: 'mchen@yahoo.com',
    role: 'watcher',
    details: 'Male, 30–35',
    status: 'pending',
    date: '2026-07-03 19:15',
    amount: 'AED 181.00 (Pending Webhook)'
  },
  {
    id: 4,
    name: 'Layla Al-Mansoori',
    phone: '+971 54 987 6543',
    email: 'layla.m@gmail.com',
    role: 'pitcher',
    details: 'Nominated: Humaid, 30 (@humaid_m). Colleague. Can attend: Yes',
    status: 'pitch',
    date: '2026-07-03 18:04',
    amount: '-'
  },
  {
    id: 5,
    name: 'Karim Ghandour',
    phone: '+971 50 246 8135',
    email: 'karim.ghandour@outlook.com',
    role: 'watcher',
    details: 'Male, 35–40',
    status: 'paid',
    date: '2026-07-03 15:40',
    amount: 'AED 181.00'
  }
]

export default function AdminPage() {
  const navigate = useNavigate()
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Dashboard states
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pricing settings states
  const [watcherPriceInput, setWatcherPriceInput] = useState('181.00')
  const [pitcherPriceInput, setPitcherPriceInput] = useState('310.00')
  const [watcherUrlInput, setWatcherUrlInput] = useState('https://pay.ziina.com/dvlp/rOSH02oXn?source=app')
  const [pitcherUrlInput, setPitcherUrlInput] = useState('https://pay.ziina.com/dvlp/gF9JPnd3e?source=app')
  const [isSavingPrices, setIsSavingPrices] = useState(false)
  const [pricingSaveMessage, setPricingSaveMessage] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [eventDateInput, setEventDateInput] = useState('')
  const [eventLocationInput, setEventLocationInput] = useState('')
  const [gallery1Input, setGallery1Input] = useState('')
  const [gallery2Input, setGallery2Input] = useState('')
  const [gallery3Input, setGallery3Input] = useState('')
  const [gallery4Input, setGallery4Input] = useState('')
  const [capPitcherMaleInput, setCapPitcherMaleInput] = useState('5')
  const [capPitcherFemaleInput, setCapPitcherFemaleInput] = useState('5')
  const [capWatcherInput, setCapWatcherInput] = useState('60')

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('Error checking active auth session:', err)
      } finally {
        setCheckingSession(false)
      }
    }
    checkActiveSession()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchRegistrations = async () => {
      try {
        setLoading(true)
        const { data: dbData, error } = await supabase
          .from('registrations')
          .select('*')
          .order('id', { ascending: false })

        if (error) throw error

        if (dbData && dbData.length > 0) {
          const transformed = dbData.map(r => ({
            id: r.id,
            name: r.name,
            phone: r.whatsapp,
            email: r.email,
            role: r.role,
            details: r.role === 'pitcher' 
              ? `Nominated: ${r.their_name || ''} (${r.pitchee_gender || ''}, ${r.relationship || ''}). Instagram: ${r.instagram || ''}. Can attend: ${r.can_attend || ''}. Pitch: ${r.pitch || ''}.${r.links ? ` Links: ${r.links}` : ''}`
              : `Gender: ${r.gender || ''}, Age: ${r.age_group || ''}`,
            status: r.status,
            date: r.created_at ? new Date(r.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).replace(',', '') : '-',
            amount: r.amount
          }))
          setData(transformed)
        } else {
          setData([])
        }
      } catch (err) {
        console.error('Error fetching registrations from Supabase:', err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    const fetchPrices = async () => {
      try {
        const { data: settingsData, error } = await supabase
          .from('settings')
          .select('*')
        if (error) throw error
        if (settingsData) {
          const watcherPriceSetting = settingsData.find(s => s.key === 'watcher_price')
          const pitcherPriceSetting = settingsData.find(s => s.key === 'pitcher_price')
          const watcherUrlSetting = settingsData.find(s => s.key === 'watcher_payment_url')
          const pitcherUrlSetting = settingsData.find(s => s.key === 'pitcher_payment_url')

          if (watcherPriceSetting) setWatcherPriceInput(watcherPriceSetting.value)
          if (pitcherPriceSetting) setPitcherPriceInput(pitcherPriceSetting.value)
          if (watcherUrlSetting) setWatcherUrlInput(watcherUrlSetting.value)
          if (pitcherUrlSetting) setPitcherUrlInput(pitcherUrlSetting.value)

          const dateSetting = settingsData.find(s => s.key === 'event_date')
          const locSetting = settingsData.find(s => s.key === 'event_location')
          if (dateSetting) setEventDateInput(dateSetting.value)
          if (locSetting) setEventLocationInput(locSetting.value)

          const g1 = settingsData.find(s => s.key === 'gallery_photo_1')
          const g2 = settingsData.find(s => s.key === 'gallery_photo_2')
          const g3 = settingsData.find(s => s.key === 'gallery_photo_3')
          const g4 = settingsData.find(s => s.key === 'gallery_photo_4')
          if (g1) setGallery1Input(g1.value)
          if (g2) setGallery2Input(g2.value)
          if (g3) setGallery3Input(g3.value)
          if (g4) setGallery4Input(g4.value)
        }
      } catch (err) {
        console.error('Error fetching prices in Admin page:', err)
      }
    }

    const fetchEventCaps = async () => {
      try {
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
        if (events && events.length > 0) {
          setCapPitcherMaleInput(String(events[0].cap_pitcher_male))
          setCapPitcherFemaleInput(String(events[0].cap_pitcher_female))
          setCapWatcherInput(String(events[0].cap_watcher))
        }
      } catch (_) {}
    }

    fetchRegistrations()
    fetchPrices()
    fetchEventCaps()
  }, [isAuthenticated])

  const handleSavePrices = async (e) => {
    e.preventDefault()
    try {
      setIsSavingPrices(true)
      setPricingSaveMessage('')
      
      // Update watcher price
      const { error: wError } = await supabase
        .from('settings')
        .upsert({ key: 'watcher_price', value: watcherPriceInput }, { onConflict: 'key' })
        
      // Update pitcher price
      const { error: pError } = await supabase
        .from('settings')
        .upsert({ key: 'pitcher_price', value: pitcherPriceInput }, { onConflict: 'key' })

      // Update watcher URL
      const { error: wUrlError } = await supabase
        .from('settings')
        .upsert({ key: 'watcher_payment_url', value: watcherUrlInput }, { onConflict: 'key' })
        
      // Update pitcher URL
      const { error: pUrlError } = await supabase
        .from('settings')
        .upsert({ key: 'pitcher_payment_url', value: pitcherUrlInput }, { onConflict: 'key' })

      // Update event date
      const { error: dateError } = await supabase
        .from('settings')
        .upsert({ key: 'event_date', value: eventDateInput }, { onConflict: 'key' })

      // Update event location
      const { error: locError } = await supabase
        .from('settings')
        .upsert({ key: 'event_location', value: eventLocationInput }, { onConflict: 'key' })

      // Update gallery photos
      const { error: g1Error } = await supabase
        .from('settings')
        .upsert({ key: 'gallery_photo_1', value: gallery1Input }, { onConflict: 'key' })

      const { error: g2Error } = await supabase
        .from('settings')
        .upsert({ key: 'gallery_photo_2', value: gallery2Input }, { onConflict: 'key' })

      const { error: g3Error } = await supabase
        .from('settings')
        .upsert({ key: 'gallery_photo_3', value: gallery3Input }, { onConflict: 'key' })

      const { error: g4Error } = await supabase
        .from('settings')
        .upsert({ key: 'gallery_photo_4', value: gallery4Input }, { onConflict: 'key' })

      if (wError || pError || wUrlError || pUrlError || dateError || locError || g1Error || g2Error || g3Error || g4Error) {
        throw new Error(
          wError?.message || 
          pError?.message || 
          wUrlError?.message || 
          pUrlError?.message ||
          dateError?.message ||
          locError?.message ||
          g1Error?.message ||
          g2Error?.message ||
          g3Error?.message ||
          g4Error?.message ||
          'Failed to save settings'
        )
      }
      
      setPricingSaveMessage('✓ Settings saved!')
      setTimeout(() => setPricingSaveMessage(''), 3000)

      // Save capacity caps to active event
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('is_active', true)
        .limit(1)
      if (events && events.length > 0) {
        await supabase
          .from('events')
          .update({
            cap_pitcher_male: parseInt(capPitcherMaleInput) || 0,
            cap_pitcher_female: parseInt(capPitcherFemaleInput) || 0,
            cap_watcher: parseInt(capWatcherInput) || 0,
          })
          .eq('id', events[0].id)
      } else {
        // No active event — create one
        await supabase
          .from('events')
          .insert({
            show_date: new Date().toISOString().split('T')[0],
            cap_pitcher_male: parseInt(capPitcherMaleInput) || 5,
            cap_pitcher_female: parseInt(capPitcherFemaleInput) || 5,
            cap_watcher: parseInt(capWatcherInput) || 60,
            is_active: true,
          })
      }
    } catch (err) {
      console.error('Failed to update settings:', err)
      setPricingSaveMessage('❌ Error: ' + err.message)
    } finally {
      setIsSavingPrices(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) {
        setLoginError(error.message)
      } else if (authData.session) {
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('An unexpected authentication error occurred.')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Export to CSV helper
  const handleExport = () => {
    const headers = 'ID,Name,Phone,Email,Role,Details,Status,Date,Amount\n'
    const csvContent = data.map(r => 
      `"${r.id}","${r.name}","${r.phone}","${r.email}","${r.role}","${r.details.replace(/"/g, '""')}","${r.status}","${r.date}","${r.amount}"`
    ).join('\n')
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'pitch_them_perfect_registrations.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered registrations list
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search)
      
      const matchesRole = roleFilter === 'all' || item.role === roleFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [data, search, roleFilter, statusFilter])

  // Count summaries
  const stats = useMemo(() => {
    const pitchers = data.filter(r => r.role === 'pitcher')
    const watchers = data.filter(r => r.role === 'watcher')
    return {
      total: data.length,
      pitchers: pitchers.length,
      pitchersMale: pitchers.filter(r => r.pitchee_gender !== 'female').length,
      pitchersFemale: pitchers.filter(r => r.pitchee_gender === 'female').length,
      paidWatchers: watchers.filter(r => r.status === 'paid').length,
      pendingWatchers: watchers.filter(r => r.status === 'pending').length,
      watchersTotal: watchers.length,
    }
  }, [data])

  // ─── Render Login Screen ──────────────────────────────────
  if (checkingSession) {
    return (
      <div className="page" style={{ justifyContent: 'center', background: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>
        <p style={{ color: '#666', fontSize: 14 }}>Checking session status...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="page" style={{ justifyContent: 'center', background: 'radial-gradient(circle at top right, #FFF5F7 0%, #F7F7F7 100%)' }}>
        <div className="page-inner" style={{ maxWidth: '400px' }}>
          
          <div className="badge">
            <span className="badge-heart">🔒</span>
            Admin Access Only
          </div>

          <div className="page-header" style={{ marginBottom: 12 }}>
            <h1 className="page-title">PTP Control</h1>
            <p className="page-tagline">Sign in to view user registrations</p>
          </div>

          <form onSubmit={handleLogin} className="form-card" style={{ gap: 20 }}>
            <div className="field">
              <label className="field-label" htmlFor="admin-email">Admin Email</label>
              <input 
                id="admin-email" 
                type="email" 
                autoComplete="email" 
                placeholder="admin@pitchthemperfect.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="admin-pass">Password</label>
              <input 
                id="admin-pass" 
                type="password" 
                autoComplete="current-password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && <p className="field-error" style={{ fontSize: 12 }}>⚠ {loginError}</p>}

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              Sign In
            </button>
          </form>

          <button 
            type="button" 
            className="back-btn" 
            onClick={() => navigate('/')} 
            style={{ alignSelf: 'center', marginTop: 12 }}
          >
            ← Back to Registration form
          </button>

        </div>
      </div>
    )
  }

  // ─── Render Admin Dashboard Screen ─────────────────────────
  return (
    <div style={{ padding: '48px 24px', minHeight: '100vh', background: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Top Navbar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 16,
          background: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: 16,
          border: '1.5px solid #FCD4E0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>✨</span>
              <h1 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#111' }}>
                PTP Admin Dashboard
              </h1>
            </div>
            <p style={{ color: '#666', fontSize: 13.5, marginTop: 4 }}>Track registrations and nominations for the next event.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              className="btn-submit-another" 
              onClick={() => navigate('/')}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0 }}
            >
              ← Go to Form
            </button>
            <button 
              className="btn-submit-another" 
              onClick={handleExport}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0, borderColor: '#E8386D', color: '#E8386D' }}
            >
              📥 Export CSV
            </button>
            <button 
              className="btn-submit-another" 
              onClick={() => setIsSettingsOpen(true)}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0 }}
            >
              ⚙️ Settings
            </button>
            <button 
              onClick={handleLogout}
              style={{ 
                fontSize: 13, 
                height: 38, 
                padding: '0 16px', 
                borderRadius: 12,
                background: '#111', 
                color: '#FFF', 
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Signups', val: stats.total, color: '#111111', icon: '👥', sub: null },
            { label: 'Pitchers (M)', val: stats.pitchersMale, color: '#E8386D', icon: '🎤♂️', sub: `cap: ${capPitcherMaleInput}` },
            { label: 'Pitchers (F)', val: stats.pitchersFemale, color: '#E8386D', icon: '🎤♀️', sub: `cap: ${capPitcherFemaleInput}` },
            { label: 'Watchers', val: stats.watchersTotal, color: '#E8386D', icon: '👁', sub: `cap: ${capWatcherInput}` },
            { label: 'Paid', val: stats.paidWatchers, color: '#2E7D32', icon: '✅', sub: null },
            { label: 'Pending', val: stats.pendingWatchers, color: '#F57F17', icon: '⏳', sub: null },
          ].map(s => (
            <div key={s.label} style={{ 
              background: '#FFF', 
              padding: '20px 18px', 
              borderRadius: 14, 
              border: '1.5px solid #FCD4E0', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10
            }}>
              <div>
                <p style={{ fontSize: 10.5, textTransform: 'uppercase', color: '#999', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: s.sub ? 2 : 0 }}>{s.val}</p>
                {s.sub && <p style={{ fontSize: 10.5, color: '#BBB', fontWeight: 500 }}>{s.sub}</p>}
              </div>
              <span style={{ fontSize: 26, opacity: 0.7 }}>{s.icon}</span>
            </div>
          ))}
        </div>

        {/* Event Pricing Settings Modal */}
        {isSettingsOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }} onClick={() => setIsSettingsOpen(false)}>
            <div 
              className="form-card" 
              style={{ 
                maxWidth: '650px', 
                width: '100%', 
                padding: '32px 24px 24px', 
                position: 'relative',
                background: '#FFF',
                border: '1.5px solid #FCD4E0',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#888',
                  lineHeight: 1
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚙️</span>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
                  Event Settings Configuration
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#666', margin: '4px 0 0 0' }}>Configure event details, ticket prices, and payment URLs.</p>
              
              <form onSubmit={handleSavePrices} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Watcher Ticket Price (AED)</label>
                    <input 
                      type="text" 
                      value={watcherPriceInput} 
                      onChange={e => setWatcherPriceInput(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1.5px solid #EBEBEB', 
                        borderRadius: 8, 
                        fontSize: 13.5, 
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                      }}
                      required
                    />
                  </div>

                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Pitcher Ticket Price (AED)</label>
                    <input 
                      type="text" 
                      value={pitcherPriceInput} 
                      onChange={e => setPitcherPriceInput(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1.5px solid #EBEBEB', 
                        borderRadius: 8, 
                        fontSize: 13.5, 
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Watcher Payment URL</label>
                    <input 
                      type="url" 
                      value={watcherUrlInput} 
                      onChange={e => setWatcherUrlInput(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1.5px solid #EBEBEB', 
                        borderRadius: 8, 
                        fontSize: 13.5, 
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                      }}
                      required
                    />
                  </div>

                  <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Pitcher Payment URL</label>
                    <input 
                      type="url" 
                      value={pitcherUrlInput} 
                      onChange={e => setPitcherUrlInput(e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1.5px solid #EBEBEB', 
                        borderRadius: 8, 
                        fontSize: 13.5, 
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1.5px solid #F0F0F0', paddingTop: 4, marginTop: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Event Landing Page</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Event Date</label>
                      <input 
                        type="text" 
                        value={eventDateInput} 
                        onChange={e => setEventDateInput(e.target.value)}
                        placeholder="e.g. August 16, 2026"
                        style={{ 
                          width: '100%',
                          padding: '10px 12px', 
                          border: '1.5px solid #EBEBEB', 
                          borderRadius: 8, 
                          fontSize: 13.5, 
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      />
                    </div>

                    <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Event Location</label>
                      <input 
                        type="text" 
                        value={eventLocationInput} 
                        onChange={e => setEventLocationInput(e.target.value)}
                        placeholder="e.g. Dubai"
                        style={{ 
                          width: '100%',
                          padding: '10px 12px', 
                          border: '1.5px solid #EBEBEB', 
                          borderRadius: 8, 
                          fontSize: 13.5, 
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px solid #F0F0F0', paddingTop: 4, marginTop: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Capacity Limits</p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Pitcher — Male</label>
                      <input type="number" min="0" value={capPitcherMaleInput}
                        onChange={e => setCapPitcherMaleInput(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #EBEBEB', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
                      <span style={{ fontSize: 11, color: stats.pitchersMale >= parseInt(capPitcherMaleInput) ? '#E8386D' : '#999', fontWeight: 600 }}>
                        {stats.pitchersMale} used · {Math.max(0, parseInt(capPitcherMaleInput) - stats.pitchersMale)} left
                      </span>
                    </div>
                    <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Pitcher — Female</label>
                      <input type="number" min="0" value={capPitcherFemaleInput}
                        onChange={e => setCapPitcherFemaleInput(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #EBEBEB', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
                      <span style={{ fontSize: 11, color: stats.pitchersFemale >= parseInt(capPitcherFemaleInput) ? '#E8386D' : '#999', fontWeight: 600 }}>
                        {stats.pitchersFemale} used · {Math.max(0, parseInt(capPitcherFemaleInput) - stats.pitchersFemale)} left
                      </span>
                    </div>
                    <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Watcher</label>
                      <input type="number" min="0" value={capWatcherInput}
                        onChange={e => setCapWatcherInput(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #EBEBEB', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
                      <span style={{ fontSize: 11, color: stats.watchersTotal >= parseInt(capWatcherInput) ? '#E8386D' : '#999', fontWeight: 600 }}>
                        {stats.watchersTotal} used · {Math.max(0, parseInt(capWatcherInput) - stats.watchersTotal)} left
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1.5px solid #F0F0F0', paddingTop: 4, marginTop: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Gallery Photos</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      { label: 'Photo 1 — Main (portrait)',  val: gallery1Input, set: setGallery1Input, slot: 1 },
                      { label: 'Photo 2 — Square',           val: gallery2Input, set: setGallery2Input, slot: 2 },
                      { label: 'Photo 3 — Square',           val: gallery3Input, set: setGallery3Input, slot: 3 },
                      { label: 'Photo 4 — Wide',             val: gallery4Input, set: setGallery4Input, slot: 4 },
                    ].map(g => {
                      const handleUpload = async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          g.set('__uploading__')
                          const path = `gallery_${g.slot}_${Date.now()}.${file.name.split('.').pop()}`
                          const { error } = await supabase.storage.from('photos').upload(path, file)
                          if (error) throw error
                          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
                          g.set(publicUrl)
                        } catch (err) {
                          console.error('Upload failed:', err)
                          g.set('')
                        }
                      }
                      const isUploading = g.val === '__uploading__'
                      return (
                        <div key={g.slot} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>{g.label}</label>
                          {g.val && !isUploading ? (
                            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1.5px solid #F0F0F0' }}>
                              <img src={g.val} alt={g.label} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                              <button
                                type="button"
                                onClick={() => g.set('')}
                                style={{
                                  position: 'absolute', top: 6, right: 6,
                                  background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                                  borderRadius: 6, width: 24, height: 24, cursor: 'pointer',
                                  fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                              >✕</button>
                            </div>
                          ) : (
                            <label style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              height: 80, border: '1.5px dashed #DCDCDC', borderRadius: 10,
                              cursor: 'pointer', color: isUploading ? '#E8386D' : '#999',
                              fontSize: 12.5, fontWeight: 600, gap: 6,
                              background: isUploading ? '#FFF5F8' : '#FAFAFA',
                              transition: 'all .15s'
                            }}>
                              {isUploading ? '⏳ Uploading...' : '📷 Choose photo'}
                              <input type="file" accept="image/*" onChange={handleUpload}
                                style={{ display: 'none' }} disabled={isUploading} />
                            </label>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 11, color: '#AAA', marginTop: 4 }}>Uploaded to Supabase Storage — public bucket.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                  <button 
                    type="submit" 
                    disabled={isSavingPrices}
                    className="btn-primary"
                    style={{ 
                      marginTop: 0, 
                      height: 40, 
                      padding: '0 20px', 
                      fontSize: 13,
                      borderRadius: 8,
                      background: isSavingPrices ? '#CCC' : '#E8386D'
                    }}
                  >
                    {isSavingPrices ? 'Saving...' : 'Save Configuration'}
                  </button>
                  {pricingSaveMessage && (
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: 600, 
                      color: pricingSaveMessage.startsWith('❌') ? '#D32F2F' : '#388E3C',
                      transition: 'opacity 0.2s'
                    }}>
                      {pricingSaveMessage}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="form-card" style={{ gap: 20, padding: 24 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            {/* Search */}
            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Search Registrants</label>
              <input 
                type="text" 
                placeholder="Search by name, email, or phone number..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 14px', 
                  border: '1.5px solid #EBEBEB', 
                  borderRadius: 10, 
                  fontSize: 13.5, 
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
                }}
              />
            </div>

            {/* Role Filter */}
            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Role Type</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pitcher', label: 'Pitcher' },
                  { value: 'watcher', label: 'Watcher' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setRoleFilter(opt.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid transparent',
                      background: roleFilter === opt.value ? '#E8386D' : '#EAECEF',
                      color: roleFilter === opt.value ? '#FFF' : '#333',
                      transition: 'all 0.15s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Payment Status</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pitch', label: 'Pitch' },
                  { value: 'pending', label: 'Pending' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid transparent',
                      background: statusFilter === opt.value ? '#E8386D' : '#EAECEF',
                      color: statusFilter === opt.value ? '#FFF' : '#333',
                      transition: 'all 0.15s'
                    }}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Table list */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          border: '1.5px solid #FCD4E0', 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#FFF5F8', borderBottom: '1.5px solid #FCD4E0' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Name</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Contact Info</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Role</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Details</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Amount</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#888' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⏳</span> Loading registrations from Supabase...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '48px 20px', textAlign: 'center', color: '#888' }}>
                      No registration matching the filters found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #FFF5F7', transition: 'background 0.15s' }} className="admin-table-row">
                      <td style={{ padding: '20px 20px', fontWeight: 700, color: '#111' }}>{row.name}</td>
                      <td style={{ padding: '20px 20px', color: '#333' }}>
                        <div style={{ fontWeight: 600 }}>{row.phone}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{row.email}</div>
                      </td>
                      <td style={{ padding: '20px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: row.role === 'pitcher' ? '#D63B6B' : '#333'
                        }}>
                          {row.role === 'pitcher' ? '🎤 Pitcher' : '👁 Watcher'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 20px', color: '#555', maxWidth: 320, lineHeight: 1.5 }}>
                        {row.details}
                      </td>
                      <td style={{ padding: '20px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: row.status === 'paid' ? '#E8F5E9' : row.status === 'pitch' ? '#FFF0F4' : '#FFFDE7',
                          color: row.status === 'paid' ? '#2E7D32' : row.status === 'pitch' ? '#E8386D' : '#F57F17',
                          border: `1px solid ${row.status === 'paid' ? '#C8E6C9' : row.status === 'pitch' ? '#FCD4E0' : '#FFF9C4'}`
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px 20px', fontWeight: 700, color: '#111' }}>
                        {row.amount}
                      </td>
                      <td style={{ padding: '20px 20px', color: '#555' }}>
                        {row.date}
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
  )
}

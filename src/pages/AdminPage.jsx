import { useState, useMemo, useEffect, useRef } from 'react'
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
  const [eventFilter, setEventFilter] = useState('active') // 'active' | 'all'
  const [refreshing, setRefreshing] = useState(false)
  const [storyCards, setStoryCards] = useState([])
  const [showStoryCards, setShowStoryCards] = useState(false)
  const fetchersRef = useRef({})

  // Pixel stats
  const fetchPixelStats = async () => {
    const { data, error } = await supabase.from('pixel_events').select('event_name, created_at').order('created_at', { ascending: false }).limit(200)
    if (error) { alert('Failed to load pixel events'); return }
    const counts = { total: data.length }
    for (const e of data) { counts[e.event_name] = (counts[e.event_name] || 0) + 1 }
    setPixelStats({ counts, events: data.slice(0, 20) })
  }
  const [pixelStats, setPixelStats] = useState(null)

  // Tabs
  const [activeTab, setActiveTab] = useState('registrations')

  // Pricing settings states
  const [watcherPriceInput, setWatcherPriceInput] = useState('181.00')
  const [pitcherPriceInput, setPitcherPriceInput] = useState('310.00')
  const [watcherUrlInput, setWatcherUrlInput] = useState('https://pay.ziina.com/dvlp/rOSH02oXn?source=app')
  const [pitcherUrlInput, setPitcherUrlInput] = useState('https://pay.ziina.com/dvlp/gF9JPnd3e?source=app')
  const [isSavingPrices, setIsSavingPrices] = useState(false)
  const [pricingSaveMessage, setPricingSaveMessage] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [eventDateInput, setEventDateInput] = useState('')
  const [eventTimeInput, setEventTimeInput] = useState('')
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
        // Get active event first to filter
        const { data: active } = await supabase
          .from('events')
          .select('id')
          .eq('is_active', true)
          .limit(1)
        const activeId = active?.[0]?.id

        let query = supabase.from('registrations').select('*').order('id', { ascending: false })
        if (eventFilter === 'active' && activeId) query = query.eq('event_id', activeId)
        const { data: dbData, error } = await query

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
            attended: r.attended || false,
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
          const timeSetting = settingsData.find(s => s.key === 'event_time')
          const locSetting = settingsData.find(s => s.key === 'event_location')
          setEventDateInput(dateSetting?.value || '')
          setEventTimeInput(timeSetting?.value || '')
          setEventLocationInput(locSetting?.value || '')

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

    // Store so refresh can call them
    fetchersRef.current = { fetchRegistrations, fetchPrices, fetchEventCaps }
  }, [isAuthenticated, eventFilter])

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

      // Update event time
      const { error: timeError } = await supabase
        .from('settings')
        .upsert({ key: 'event_time', value: eventTimeInput }, { onConflict: 'key' })

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

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) {
      console.error('Status update error:', error)
      return
    }
    // Optimistic update
    setData(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
  }

  const handleToggleAttended = async (id, current) => {
    const newVal = !current
    const { error } = await supabase
      .from('registrations')
      .update({ attended: newVal })
      .eq('id', id)
    if (error) {
      console.error('Attended update error:', error)
      return
    }
    setData(prev => prev.map(r => r.id === id ? { ...r, attended: newVal } : r))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const f = fetchersRef.current
    if (f.fetchRegistrations && f.fetchPrices && f.fetchEventCaps) {
      await Promise.all([f.fetchRegistrations(), f.fetchPrices(), f.fetchEventCaps()])
    }
    setRefreshing(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration permanently?')) return
    const { error } = await supabase.from('registrations').delete().eq('id', id)
    if (error) { console.error('Delete error:', error); return }
    setData(prev => prev.filter(r => r.id !== id))
  }

  const handleConfirmPayment = async (row) => {
    if (!window.confirm(`Confirm payment for ${row.name}? This will send the confirmation email.`)) return
    const newStatus = row.role === 'pitcher' ? 'confirmed' : 'paid'
    const { error } = await supabase
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', row.id)
    if (error) { console.error('Confirm error:', error); alert('Failed to update: ' + error.message); return }
    setData(prev => prev.map(r => r.id === row.id ? { ...r, status: newStatus } : r))
    // Trigger confirmation email
    try {
      await fetch('https://tnohztvpuflwkltkbphg.supabase.co/functions/v1/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: `${row.id}` }),
      })
    } catch (_) {}
  }

  const handleNewEvent = async () => {
    if (!window.confirm('Start a new event? This will archive the current event and reset all capacity counters. Old data is preserved.')) return
    // Deactivate current
    await supabase.from('events').update({ is_active: false }).eq('is_active', true)
    // Create new with same caps
    await supabase.from('events').insert({
      show_date: new Date().toISOString().split('T')[0],
      cap_pitcher_male: parseInt(capPitcherMaleInput) || 5,
      cap_pitcher_female: parseInt(capPitcherFemaleInput) || 5,
      cap_watcher: parseInt(capWatcherInput) || 60,
      is_active: true,
    })
    // Clear event cache so next fetch gets the new one
    import('../lib/event').then(m => m.clearEventCache())
    handleRefresh()
  }

  const fetchStoryCards = async () => {
    const { data: active } = await supabase.from('events').select('id').eq('is_active', true).limit(1)
    const activeId = active?.[0]?.id
    let query = supabase.from('story_cards').select('*').order('created_at', { ascending: false }).limit(100)
    if (activeId) query = query.eq('event_id', activeId)
    const { data } = await query
    if (data) setStoryCards(data)
    setShowStoryCards(true)
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
      pitchersConfirmed: pitchers.filter(r => r.status === 'confirmed' || r.status === 'pitch').length,
      pitchersPending: pitchers.filter(r => r.status === 'pending').length,
      waitlist: data.filter(r => r.status === 'waitlist').length,
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
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0 }}
            >
              {refreshing ? '⏳' : '🔄'} Refresh
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
              className="btn-submit-another" 
              onClick={fetchStoryCards}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0, borderColor: '#E8386D', color: '#E8386D' }}
            >
              📝 Story Cards
            </button>
            <button 
              onClick={fetchPixelStats}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0, borderColor: '#888', color: '#888' }}
            >
              📊 Pixel Log
            </button>
            <button 
              className="btn-submit-another" 
              onClick={() => window.open('/live', '_blank')}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0 }}
            >
              📱 Live Form
            </button>
            <button 
              className="btn-submit-another" 
              onClick={() => window.open('/qr', '_blank')}
              style={{ fontSize: 13, height: 38, padding: '0 16px', marginTop: 0 }}
            >
              🖨 Print QR
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

        {/* ─── Tab Bar ─── */}
        <div style={{ display: 'flex', gap: 4, background: '#FFF', borderRadius: 12, padding: 4, border: '1.5px solid #EAECEF' }}>
          {[
            { id: 'registrations', label: '📋 Registrations' },
            { id: 'analytics',    label: '📊 Analytics' },
            { id: 'storycards',   label: '⭐ Story Cards' },
            { id: 'settings',     label: '⚙️ Settings' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 9, border: 'none',
                background: activeTab === tab.id ? '#111' : 'transparent',
                color: activeTab === tab.id ? '#FFF' : '#888',
                fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Registrations ─── */}
        {activeTab === 'registrations' && (<>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Signups', val: stats.total, color: '#111111', icon: '👥', sub: null },
            { label: 'Pitchers (M)', val: stats.pitchersMale, color: '#E8386D', icon: '🎤♂️', sub: `cap: ${capPitcherMaleInput}` },
            { label: 'Pitchers (F)', val: stats.pitchersFemale, color: '#E8386D', icon: '🎤♀️', sub: `cap: ${capPitcherFemaleInput}` },
            { label: 'Pitcher Confirmed', val: stats.pitchersConfirmed, color: '#2E7D32', icon: '✅', sub: `pending: ${stats.pitchersPending}` },
            { label: 'Watchers', val: stats.watchersTotal, color: '#E8386D', icon: '👁', sub: `cap: ${capWatcherInput}` },
            { label: 'Watcher Paid', val: stats.paidWatchers, color: '#2E7D32', icon: '💳', sub: `pending: ${stats.pendingWatchers}` },
            { label: 'Waitlist', val: stats.waitlist, color: '#B8860B', icon: '📋', sub: 'overflow' },
            { label: 'Pitcher M left', val: Math.max(0, parseInt(capPitcherMaleInput) - stats.pitchersMale), color: '#E8386D', icon: '🎤♂️', sub: `of ${capPitcherMaleInput}` },
            { label: 'Pitcher F left', val: Math.max(0, parseInt(capPitcherFemaleInput) - stats.pitchersFemale), color: '#E8386D', icon: '🎤♀️', sub: `of ${capPitcherFemaleInput}` },
            { label: 'Watcher left', val: Math.max(0, parseInt(capWatcherInput) - stats.watchersTotal), color: '#E8386D', icon: '👁', sub: `of ${capWatcherInput}` },
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
                maxHeight: '85vh',
                overflowY: 'auto',
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
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Time</label>
                      <input 
                        type="text" 
                        value={eventTimeInput} 
                        onChange={e => setEventTimeInput(e.target.value)}
                        placeholder="e.g. 7:00 PM"
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
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#444' }}>Venue</label>
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
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Event Lifecycle</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8F9FA', borderRadius: 8 }}>
                      <span style={{ fontSize: 18 }}>📅</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{eventDateInput || 'Current Event'}</p>
                        <p style={{ fontSize: 11, color: '#999' }}>{eventLocationInput || 'Location not set'}</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleNewEvent}
                      style={{
                        padding: '10px 18px', borderRadius: 8, border: '2px solid #E8386D',
                        background: '#FFF', color: '#E8386D', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit', whiteSpace: 'nowrap'
                      }}>+ New Event</button>
                  </div>
                  <p style={{ fontSize: 11, color: '#AAA', marginTop: 6 }}>Starts a fresh event. Current registrations are preserved but won't count toward new capacity.</p>
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

            {/* Event Filter */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Event</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { value: 'active', label: 'Current' },
                  { value: 'all', label: 'All Events' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => setEventFilter(opt.value)}
                    style={{
                      padding: '10px 16px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', border: '1.5px solid transparent',
                      background: eventFilter === opt.value ? '#E8386D' : '#EAECEF',
                      color: eventFilter === opt.value ? '#FFF' : '#333',
                      transition: 'all 0.15s'
                    }}>{opt.label}</button>
                ))}
              </div>
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
                  { value: 'pending', label: 'Pending' },
                  { value: 'waitlist', label: 'Waitlist' }
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
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>📝 Pitch</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Attended</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Amount</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Registered At</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#111' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '48px 20px', textAlign: 'center', color: '#888' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: 8 }}>⏳</span> Loading registrations from Supabase...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '48px 20px', textAlign: 'center', color: '#888' }}>
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
                      <td style={{ padding: '20px 20px', color: '#555', maxWidth: 320, lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {row.details}
                      </td>
                      <td style={{ padding: '20px 20px', color: '#333', maxWidth: 280, lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'break-word', fontSize: 13 }}>
                        {row.role === 'pitcher' && row.pitch
                          ? <span style={{ color: '#111', fontWeight: 600 }}>"{row.pitch}"</span>
                          : <span style={{ color: '#CCC' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '20px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          padding: '6px 12px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: row.status === 'paid' ? '#E8F5E9' : row.status === 'pitch' ? '#FFF0F4' : row.status === 'waitlist' ? '#FFFBF0' : '#FFFDE7',
                          color: row.status === 'paid' ? '#2E7D32' : row.status === 'pitch' ? '#E8386D' : row.status === 'waitlist' ? '#B8860B' : '#F57F17',
                          border: `1px solid ${row.status === 'paid' ? '#C8E6C9' : row.status === 'pitch' ? '#FCD4E0' : row.status === 'waitlist' ? '#F5E6C8' : '#FFF9C4'}`
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
                      <td style={{ padding: '20px 20px' }}>
                        {/* Attended checkbox */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: row.attended ? '#2E7D32' : '#AAA' }}>
                          <input type="checkbox" checked={row.attended || false}
                            onChange={() => handleToggleAttended(row.id, row.attended)}
                            style={{ accentColor: '#E8386D', cursor: 'pointer' }} />
                          {row.attended ? '✓ Yes' : 'Mark'}
                        </label>
                      </td>
                      <td style={{ padding: '20px 20px' }}>
                        {/* Actions: confirm payment for pending */}
                        {row.status === 'pending' && (
                          <button onClick={() => handleConfirmPayment(row)}
                            style={{
                              padding: '5px 12px', borderRadius: 6, border: '1.5px solid #E8386D',
                              background: '#FFF', color: '#E8386D', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', marginRight: 6
                            }}>💳 Confirm</button>
                        )}
                        {/* Actions: approve/decline for pitchers */}
                        {row.role === 'pitcher' && row.status === 'pitch' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleUpdateStatus(row.id, 'confirmed')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9', cursor: 'pointer'
                              }}>✓ Approve</button>
                            <button onClick={() => handleUpdateStatus(row.id, 'declined')}
                              style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', cursor: 'pointer'
                              }}>✕ Decline</button>
                          </div>
                        ) : row.status === 'waitlist' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleUpdateStatus(row.id, row.role === 'pitcher' ? 'pitch' : 'pending')}
                              title={row.role === 'pitcher' ? 'Move to active pitcher list' : 'Move to active watcher list'}
                              style={{
                                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9', cursor: 'pointer'
                              }}>↑ Promote</button>
                          </div>
                        ) : row.role === 'pitcher' && row.status === 'confirmed' ? (
                          <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>Approved ✓</span>
                        ) : row.role === 'pitcher' && row.status === 'declined' ? (
                          <span style={{ fontSize: 11, color: '#C62828', fontWeight: 600 }}>Declined</span>
                        ) : null}
                        <button onClick={() => handleDelete(row.id)}
                          style={{
                            padding: '4px 10px', borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                            background: 'transparent', color: '#CCC', border: '1px solid #EEE', cursor: 'pointer',
                            marginTop: 6
                          }}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>)}

        {/* ─── Tab: Analytics ─── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onClick={() => fetchPixelStats()}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Signups', val: stats.total, icon: '👥' },
                { label: 'Pitchers (M)', val: stats.pitchersMale, icon: '🎤♂️', sub: `cap: ${capPitcherMaleInput}` },
                { label: 'Pitchers (F)', val: stats.pitchersFemale, icon: '🎤♀️', sub: `cap: ${capPitcherFemaleInput}` },
                { label: 'Pitcher Confirmed', val: stats.pitchersConfirmed, icon: '✅', sub: `pending: ${stats.pitchersPending}` },
                { label: 'Watchers', val: stats.watchersTotal, icon: '👁', sub: `cap: ${capWatcherInput}` },
                { label: 'Watcher Paid', val: stats.paidWatchers, icon: '💳', sub: `pending: ${stats.pendingWatchers}` },
                { label: 'Waitlist', val: stats.waitlist, icon: '📋' },
                { label: 'Pitcher M left', val: Math.max(0, parseInt(capPitcherMaleInput) - stats.pitchersMale), icon: '🎤♂️', sub: `of ${capPitcherMaleInput}` },
                { label: 'Pitcher F left', val: Math.max(0, parseInt(capPitcherFemaleInput) - stats.pitchersFemale), icon: '🎤♀️', sub: `of ${capPitcherFemaleInput}` },
                { label: 'Watcher left', val: Math.max(0, parseInt(capWatcherInput) - stats.watchersTotal), icon: '👁', sub: `of ${capWatcherInput}` },
              ].map(s => (
                <div key={s.label} style={{ background: '#FFF', borderRadius: 12, padding: '20px', border: '1.5px solid #EAECEF', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#111' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#999', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  {s.sub && <div style={{ fontSize: 10, color: '#BBB', marginTop: 2 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
            <button onClick={fetchPixelStats} style={{ padding: '16px', borderRadius: 12, border: '1.5px dashed #CCC', background: '#FFF', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#666' }}>
              📊 Load Pixel Event Data
            </button>
          </div>
        )}

        {/* ─── Tab: Story Cards ─── */}
        {activeTab === 'storycards' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF', borderRadius: 16, border: '1.5px solid #FCD4E0' }}
            onClick={() => setShowStoryCards(true)}>
            <span style={{ fontSize: 48 }}>⭐</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Live Story Cards</h3>
            <p style={{ color: '#888', fontSize: 13.5, marginTop: 8 }}>View and manage guest story submissions in real-time during the event.</p>
            <button style={{ marginTop: 16, padding: '12px 24px', borderRadius: 8, background: '#E8386D', color: '#FFF', border: 'none', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', fontSize: 14 }}>
              📝 Open Story Cards
            </button>
          </div>
        )}

        {/* ─── Tab: Settings ─── */}
        {activeTab === 'settings' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF', borderRadius: 16, border: '1.5px solid #EAECEF' }}
            onClick={() => setIsSettingsOpen(true)}>
            <span style={{ fontSize: 48 }}>⚙️</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Event Settings</h3>
            <p style={{ color: '#888', fontSize: 13.5, marginTop: 8 }}>Configure prices, event details, capacity limits, and gallery photos.</p>
            <button style={{ marginTop: 16, padding: '12px 24px', borderRadius: 8, background: '#111', color: '#FFF', border: 'none', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', fontSize: 14 }}>
              ⚙️ Open Settings
            </button>
          </div>
        )}

        {/* Story Cards Modal */}
        {showStoryCards && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }} onClick={() => setShowStoryCards(false)}>
            <div style={{
              maxWidth: '550px', width: '100%', maxHeight: '80vh',
              background: '#FFF', borderRadius: 16, padding: '28px 24px',
              border: '1.5px solid #FCD4E0', overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111', margin: 0 }}>📝 Live Story Cards</h2>
                  <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>{storyCards.length} stories from guest tables</p>
                </div>
                <button onClick={() => { setShowStoryCards(false); clearInterval(window.__storyInterval) }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={fetchStoryCards}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1.5px solid #FCD4E0',
                    background: '#FFF5F8', color: '#E8386D', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}>🔄 Refresh</button>
                <button onClick={() => {
                  if (window.__storyInterval) { clearInterval(window.__storyInterval); window.__storyInterval = null }
                  else { fetchStoryCards(); window.__storyInterval = setInterval(fetchStoryCards, 5000) }
                }}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1.5px solid #FCD4E0',
                    background: '#FFF', color: '#E8386D', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                  id="auto-refresh-btn">⏱ Auto-refresh</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: '60vh' }}>
                {storyCards.length === 0 ? (
                  <p style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: 40 }}>No stories yet. Share the /live QR code with guests.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                    {storyCards.map((card, i) => (
                    <div key={card.id} style={{
                      padding: '16px', marginBottom: 8, borderRadius: 12,
                      background: i % 2 === 0 ? '#FFF5F8' : '#FFF',
                      border: '1px solid #FEF0F4',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>
                          {card.name}
                          {card.table_number && <span style={{ fontWeight: 400, color: '#CCC', marginLeft: 6, fontSize: 11 }}>· Table {card.table_number}</span>}
                        </span>
                        <span style={{ fontSize: 10, color: '#CCC' }}>
                          {new Date(card.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>{card.message}</p>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pixel Stats Modal */}
        {pixelStats && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }} onClick={() => setPixelStats(null)}>
            <div style={{
              maxWidth: '500px', width: '100%', background: '#FFF', borderRadius: 16,
              padding: '32px 24px', border: '1.5px solid #FCD4E0', maxHeight: '80vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>📊 Pixel Event Log</h3>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: '12px', background: '#FCE4EC', borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#E8386D' }}>{pixelStats.counts.lead || 0}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Leads</div>
                </div>
                <div style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: '12px', background: '#FFF3E0', borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#F57C00' }}>{pixelStats.counts.complete_registration || 0}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>CompleteReg</div>
                </div>
                <div style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: '12px', background: '#E8F5E9', borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#388E3C' }}>{pixelStats.counts.purchase || 0}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>Purchase</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Last 20 events:</div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {pixelStats.events.map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F5F5F5', fontSize: 12 }}>
                    <span style={{ fontWeight: 700 }}>{e.event_name}</span>
                    <span style={{ color: '#AAA' }}>{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setPixelStats(null)} style={{ marginTop: 16, width: '100%', padding: '10px', borderRadius: 8, border: '1.5px solid #EBEBEB', background: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

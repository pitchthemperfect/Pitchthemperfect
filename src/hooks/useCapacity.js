import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

/**
 * Fetch capacity info for the active event.
 * Returns { caps, counts, remaining, loading, error }
 */
export function useCapacity() {
  const [caps, setCaps] = useState({ pitcher_male: 5, pitcher_female: 5, watcher: 60 })
  const [counts, setCounts] = useState({ pitcher_male: 0, pitcher_female: 0, watcher: 0 })
  const [eventId, setEventId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        // Get active event
        const { data: events, error: evErr } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)

        if (evErr) throw evErr
        if (!events || events.length === 0) {
          setLoading(false)
          return // No active event — use defaults
        }

        const ev = events[0]
        setEventId(ev.id)
        setCaps({
          pitcher_male: ev.cap_pitcher_male,
          pitcher_female: ev.cap_pitcher_female,
          watcher: ev.cap_watcher,
        })

        // Count confirmed registrations per category for THIS event only
        const { data: regs, error: regErr } = await supabase
          .from('registrations')
          .select('role, pitchee_gender, status')
          .eq('event_id', ev.id)

        if (regErr) throw regErr

        const counts = {
          pitcher_male: 0,
          pitcher_female: 0,
          watcher: 0,
        }

        if (regs) {
          for (const r of regs) {
            if (r.role === 'watcher' && (r.status === 'paid' || r.status === 'pending')) {
              counts.watcher++
            } else if (r.role === 'pitcher' && r.status === 'paid') {
              // Capacity is split by pitchee gender
              if ((r.pitchee_gender || '').toLowerCase() === 'female') {
                counts.pitcher_female++
              } else if ((r.pitchee_gender || '').toLowerCase() === 'male') {
                counts.pitcher_male++
              }
              // empty pitchee_gender → don't count in either
            }
          }
        }

        setCounts(counts)
      } catch (err) {
        console.error('useCapacity error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const remaining = {
    pitcher_male: Math.max(0, caps.pitcher_male - counts.pitcher_male),
    pitcher_female: Math.max(0, caps.pitcher_female - counts.pitcher_female),
    watcher: Math.max(0, caps.watcher - counts.watcher),
  }

  const isSoldOut = {
    pitcher_male: remaining.pitcher_male <= 0,
    pitcher_female: remaining.pitcher_female <= 0,
    watcher: remaining.watcher <= 0,
  }

  return { caps, counts, remaining, isSoldOut, eventId, loading, error }
}

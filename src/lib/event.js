import { supabase } from '../utils/supabaseClient'

let cachedEventId = null

/** Get the active event ID. Caches after first fetch. */
export async function getActiveEventId() {
  if (cachedEventId) return cachedEventId
  const { data } = await supabase
    .from('events')
    .select('id')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
  if (data && data.length > 0) {
    cachedEventId = data[0].id
    return cachedEventId
  }
  return null
}

/** Clear cache so next call re-fetches */
export function clearEventCache() {
  cachedEventId = null
}

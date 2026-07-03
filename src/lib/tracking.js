/**
 * Tracking — Google Tag Manager + dataLayer events.
 * Set VITE_GTM_ID in .env to enable.
 * Loads GTM programmatically via main.jsx init.
 */

const GTM_ID = import.meta.env.VITE_GTM_ID || ''

/** Call once from main.jsx to bootstrap GTM */
export function initGTM() {
  if (!GTM_ID) return
  window.dataLayer = window.dataLayer || []

  // GTM noscript fallback
  const noscript = document.createElement('noscript')
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`
  document.body.insertBefore(noscript, document.body.firstChild)

  // GTM script
  const script = document.createElement('script')
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`
  document.head.appendChild(script)
}

/** Push event to dataLayer → GTM → Meta Pixel, GA4, etc. */
export function track(event, params = {}) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...params })
}

/** User clicks a CTA or begins registration */
export function trackLead(detail = {}) {
  track('lead', { registration_type: detail.role || 'unknown', ...detail })
}

/** User completes registration / payment */
export function trackCompleteRegistration(detail = {}) {
  track('complete_registration', { registration_type: detail.role || 'unknown', ...detail })
}

/** User lands on success / thank-you page */
export function trackPurchase(detail = {}) {
  track('purchase', { registration_type: detail.role || 'unknown', ...detail })
}

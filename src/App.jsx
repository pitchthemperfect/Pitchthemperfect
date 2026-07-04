import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy-load all pages — only LandingPage loads initially
const LandingPage = lazy(() => import('./pages/LandingPage'))
const RegisterStep1 = lazy(() => import('./pages/RegisterStep1'))
const WatcherStep2 = lazy(() => import('./pages/WatcherStep2'))
const PitcherStep2 = lazy(() => import('./pages/PitcherStep2'))
const PitcherSuccess = lazy(() => import('./pages/PitcherSuccess'))
const WatcherPayment = lazy(() => import('./pages/WatcherPayment'))
const WatcherSuccess = lazy(() => import('./pages/WatcherSuccess'))
const PitcherPayment = lazy(() => import('./pages/PitcherPayment'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const WaitlistSuccess = lazy(() => import('./pages/WaitlistSuccess'))
const LiveStory = lazy(() => import('./pages/LiveStory'))
const QRPage = lazy(() => import('./pages/QRPage'))

const Loading = () => (
  <div style={{
    minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAFAFA', fontFamily: "'Inter', sans-serif"
  }}>
    <p style={{ color: '#CCC', fontSize: 14, fontWeight: 500 }}>Loading...</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/live" element={<LiveStory />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/registration" element={<RegisterStep1 />} />
          <Route path="/register" element={<Navigate to="/registration" replace />} />
          <Route path="/register/watcher" element={<WatcherStep2 />} />
          <Route path="/register/pitcher" element={<PitcherStep2 />} />
          <Route path="/register/pitcher/success" element={<PitcherSuccess />} />
          <Route path="/payment/watcher" element={<WatcherPayment />} />
          <Route path="/success/watcher" element={<WatcherSuccess />} />
          <Route path="/payment/pitcher" element={<PitcherPayment />} />
          <Route path="/waitlist" element={<WaitlistSuccess />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

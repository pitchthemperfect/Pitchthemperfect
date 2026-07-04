import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterStep1 from './pages/RegisterStep1'
import WatcherStep2 from './pages/WatcherStep2'
import PitcherStep2 from './pages/PitcherStep2'
import PitcherSuccess from './pages/PitcherSuccess'
import WatcherPayment from './pages/WatcherPayment'
import WatcherSuccess from './pages/WatcherSuccess'
import PitcherPayment from './pages/PitcherPayment'
import AdminPage from './pages/AdminPage'
import WaitlistSuccess from './pages/WaitlistSuccess'
import LiveStory from './pages/LiveStory'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/live" element={<LiveStory />} />
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
    </BrowserRouter>
  )
}

import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import ClassDispositionPage from './pages/ClassDispositionPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'
import HistoryPage from './pages/HistoryPage'
import TestPage from './pages/TestPage'
import PromoPage from './pages/PromoPage'
import PromoDetailPage from './pages/PromoDetailPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PlanTestPage from './pages/PlanTestPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route index element={<HomePage />} />
        <Route path="/Room" element={<RoomPage />} />
        <Route path="/ClassDisposition" element={<ClassDispositionPage />} />
        <Route path="/History" element={<HistoryPage />} />
        <Route path="/Promo" element={<PromoPage />} />
        <Route path="/Promo/:id" element={<PromoDetailPage />} />
        <Route path="/Profile" element={<ProfilePage />} />
        <Route path="/Settings" element={<SettingsPage />} />
        <Route path="/Test" element={<TestPage />} />
        <Route path="/PlanTest" element={<PlanTestPage />} />
      </Route>
    </Routes>
  )
}

export default App

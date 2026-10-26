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
        <Route path="/Test" element={<TestPage />} />
      </Route>
    </Routes>
  )
}

export default App

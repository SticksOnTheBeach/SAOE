import { Routes, Route } from 'react-router'
import ClassDispositionPage from './pages/ClassDispositionPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import RoomPage from './pages/RoomPage'

function App() {
  return (
    <Routes>
      <Route element={<ClassDispositionPage />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route index element={<HomePage />} />
        <Route path="/Room" element={<RoomPage />} />
      </Route>
    </Routes>
  )
}

export default App
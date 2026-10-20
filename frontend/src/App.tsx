import { Routes, Route } from 'react-router'
import ClassDispositionPage from './pages/ClassDispositionPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
//import SecretaryPage from './pages/SecretaryPage'
import TeachersPage from './pages/TeachersPage'
import StudentsPage from './pages/StudentsPage'

function App() {
  return (
    <Routes>
      <Route element={<ClassDispositionPage />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route index element={<HomePage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="students" element={<StudentsPage />} />
      </Route>
    </Routes>
  )
}

export default App
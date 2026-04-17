import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import TrilhaNav from './components/TrilhaNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NovaAnalise from './pages/NovaAnalise'
import ResultadoAnalise from './pages/ResultadoAnalise'

export default function TrilhaClara() {
  const [loggedIn, setLoggedIn] = useState(false)
  const navigate = useNavigate()

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TrilhaNav
        onLogout={() => {
          setLoggedIn(false)
          navigate('/trilha-clara')
        }}
      />
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="nova-analise" element={<NovaAnalise />} />
        <Route path="analise/:id" element={<ResultadoAnalise />} />
        <Route path="*" element={<Navigate to="/trilha-clara" replace />} />
      </Routes>
    </div>
  )
}

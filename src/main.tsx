import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import TrilhaClara from './trilha-clara'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccessibilityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/trilha-clara/*" element={<TrilhaClara />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AccessibilityProvider>
  </StrictMode>,
)

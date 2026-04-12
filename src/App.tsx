import { useState, useCallback, useRef, useEffect } from 'react'
import AlertBar from './components/AlertBar'
import IdentityBar from './components/IdentityBar'
import Nav from './components/Nav'
import Hero from './components/Hero'
import FeaturedServices from './components/FeaturedServices'
import StatusDashboard from './components/StatusDashboard'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import ChatSection from './components/Chat'
import BottomBar from './components/Chat/BottomBar'
import AllServices from './components/AllServices'
import Hospitals from './components/Hospitals'
import AdminDashboard from './components/AdminDashboard'
import type { Message } from './types'
import { BOTTOM_CHAT_INPUT_ID, HERO_CONSULTA_ID } from './a11y/constants'

let msgId = 0
const uid = () => String(++msgId)

const SESSION_KEY = 'guia-cidadao-session'
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export default function App() {
  const [chatStarted, setChatStarted] = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)
  const [showHospitals, setShowHospitals] = useState(false)
  const [showAdmin, setShowAdmin] = useState(() => window.location.hash === '#admin')
  const [messages, setMessages] = useState<Message[]>([])
  const sessionId = useRef(getSessionId())
  const mainRef = useRef<HTMLElement>(null)
  const didFocusChatInputOnStart = useRef(false)

  const send = useCallback(async (text: string) => {
    if (showAllServices) setShowAllServices(false)
    if (showHospitals) setShowHospitals(false)
    if (!chatStarted) setChatStarted(true)

    const userMsg: Message = { id: uid(), type: 'user', text }
    const typingMsg: Message = { id: uid(), type: 'ai', text: '', data: undefined }

    setMessages(prev => [...prev, userMsg, typingMsg])

    const apiBases = [
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL,
      '/api',
      'http://localhost:8080/api',
    ].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i)

    try {
      let data: Message['data'] = null

      for (const base of apiBases) {
        try {
          const res = await fetch(`${base}/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId: sessionId.current }),
          })

          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          data = await res.json()
          break
        } catch {
          data = null
          continue
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: data ?? null }
            : m,
        ),
      )
    } catch (error) {
      console.error('Erro ao chamar API:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: null }
            : m,
        ),
      )
    }
  }, [chatStarted, showAllServices, showHospitals])

  const handleNavServicesClick = () => {
    setChatStarted(false)
    setShowHospitals(false)
    setShowAllServices(true)
  }

  const handleNavUnitsClick = () => {
    setChatStarted(false)
    setShowAllServices(false)
    setShowHospitals(true)
  }

  const handleHomeClick = () => {
    setChatStarted(false)
    setShowAllServices(false)
    setShowHospitals(false)
    setShowAdmin(false)
    window.history.replaceState(null, '', window.location.pathname)
  }

  useEffect(() => {
    const onHash = () => setShowAdmin(window.location.hash === '#admin')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const skipToMain = () => {
    mainRef.current?.focus()
  }

  useEffect(() => {
    document.title = chatStarted ? 'Conversa — Guia Cidadão · GDF' : 'Guia Cidadão — GDF'
  }, [chatStarted])

  useEffect(() => {
    if (!chatStarted || didFocusChatInputOnStart.current) return
    didFocusChatInputOnStart.current = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(BOTTOM_CHAT_INPUT_ID)?.focus()
      })
    })
  }, [chatStarted])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return
      const k = e.key
      if (k === '1' || k === 'Digit1') {
        e.preventDefault()
        mainRef.current?.focus()
      }
      if (k === '2' || k === 'Digit2') {
        e.preventDefault()
        if (chatStarted) {
          document.getElementById(BOTTOM_CHAT_INPUT_ID)?.focus()
        } else {
          document.getElementById(HERO_CONSULTA_ID)?.focus()
        }
      }
    }
    globalThis.window?.addEventListener('keydown', onKeyDown)
    return () => globalThis.window?.removeEventListener('keydown', onKeyDown)
  }, [chatStarted])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <p className="sr-only" id="a11y-shortcuts-hint">
        Atalhos de teclado: Alt mais 1 leva ao conteúdo principal. Alt mais 2 leva ao campo de pergunta ao assistente.
      </p>
      <a
        href="#main-content"
        onClick={e => {
          e.preventDefault()
          skipToMain()
        }}
        className="skip-to-content"
        aria-describedby="a11y-shortcuts-hint"
      >
        Pular para o conteúdo principal
      </a>

      <header>
        <AlertBar />
        <IdentityBar />
        <Nav
          onServicesClick={handleNavServicesClick}
          onUnitsClick={handleNavUnitsClick}
          onHomeClick={handleHomeClick}
        />
      </header>

      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className="outline-none"
        aria-label={
          showAllServices
            ? 'Lista de serviços'
            : showHospitals
              ? 'Hospitais e unidades'
              : chatStarted
                ? 'Conversa com o Guia Cidadão'
                : 'Serviços e informações ao cidadão'
        }
      >
        {showAdmin ? (
          <AdminDashboard onBack={handleHomeClick} />
        ) : (<>
        {!showAllServices && !showHospitals && (
          <Hero compact={chatStarted} onSend={send} />
        )}

        {showAllServices ? (
          <AllServices onServiceClick={send} onBack={handleHomeClick} />
        ) : showHospitals ? (
          <Hospitals onBack={handleHomeClick} />
        ) : chatStarted ? (
          <>
            <ChatSection messages={messages} onRelated={send} />
            <BottomBar onSend={send} />
          </>
        ) : (
          <>
            <FeaturedServices onServiceClick={send} />
            <StatusDashboard
              onHospitalsClick={handleNavUnitsClick}
              onMetricClick={send}
            />
            <FAQ onQuery={send} />
            <Footer />
          </>
        )}
        </>)}
      </main>
    </div>
  )
}

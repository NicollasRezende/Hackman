import { useState, useCallback, useRef } from 'react'
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
import type { Message } from './types'

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
  const [messages, setMessages] = useState<Message[]>([])
  const sessionId = useRef(getSessionId())

  const send = useCallback(async (text: string) => {
    if (showAllServices) setShowAllServices(false)
    if (!chatStarted) setChatStarted(true)

    // Add user message
    const userMsg: Message = { id: uid(), type: 'user', text }
    // Add typing placeholder (data: undefined = typing)
    const typingMsg: Message = { id: uid(), type: 'ai', text: '', data: undefined }

    setMessages(prev => [...prev, userMsg, typingMsg])

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      })

      const data = await res.json()

      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: data ?? null }
            : m
        )
      )
    } catch (error) {
      console.error('Erro ao chamar API:', error)
      setMessages(prev =>
        prev.map(m =>
          m.id === typingMsg.id
            ? { ...m, data: null }
            : m
        )
      )
    }
  }, [chatStarted, showAllServices])

  const handleNavServicesClick = () => {
    setChatStarted(false)
    setShowAllServices(true)
  }

  const handleHomeClick = () => {
    setChatStarted(false)
    setShowAllServices(false)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AlertBar />
      <IdentityBar />
      <Nav onServicesClick={handleNavServicesClick} onHomeClick={handleHomeClick} />
      
      {!showAllServices && <Hero compact={chatStarted} onSend={send} />}

      {showAllServices ? (
        <AllServices onServiceClick={send} onBack={handleHomeClick} />
      ) : chatStarted ? (
        <>
          <ChatSection messages={messages} onRelated={send} />
          <BottomBar onSend={send} />
        </>
      ) : (
        <>
          <FeaturedServices onServiceClick={send} />
          <StatusDashboard onCardClick={send} />
          <FAQ onQuery={send} />
          <Footer />
        </>
      )}
    </div>
  )
}

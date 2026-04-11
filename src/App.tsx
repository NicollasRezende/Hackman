import { useState, useCallback } from 'react'
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
import { matchResponse } from './data/responses'
import type { Message } from './types'

let msgId = 0
const uid = () => String(++msgId)

export default function App() {
  const [chatStarted, setChatStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const send = useCallback(async (text: string) => {
    if (!chatStarted) setChatStarted(true)

    // Add user message
    const userMsg: Message = { id: uid(), type: 'user', text }
    // Add typing placeholder (data: undefined = typing)
    const typingMsg: Message = { id: uid(), type: 'ai', text: '', data: undefined }

    setMessages(prev => [...prev, userMsg, typingMsg])

    // Scroll happens in ChatSection via useEffect

    await new Promise(r => setTimeout(r, 900 + Math.random() * 700))

    const data = matchResponse(text)

    setMessages(prev =>
      prev.map(m =>
        m.id === typingMsg.id
          ? { ...m, data: data ?? null } // null = default message
          : m
      )
    )
  }, [chatStarted])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AlertBar />
      <IdentityBar />
      <Nav />
      <Hero compact={chatStarted} onSend={send} />

      {chatStarted ? (
        <>
          <ChatSection messages={messages} onRelated={send} />
          <BottomBar onSend={send} />
        </>
      ) : (
        <>
          <FeaturedServices onServiceClick={send} />
          <StatusDashboard />
          <FAQ onQuery={send} />
          <Footer />
        </>
      )}
    </div>
  )
}

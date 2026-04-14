import { useEffect, useRef, useState } from 'react'
import AIMessage from './AIMessage'
import DefaultMessage from './DefaultMessage'
import type { Message } from '../../types'

interface Props {
  messages: Message[]
  onRelated: (q: string) => void
  sessionId?: string
}

function statusFromMessages(messages: Message[]): string {
  if (messages.length === 0) return ''
  const last = messages[messages.length - 1]
  if (last.type !== 'ai') return ''
  if (last.data === undefined) return 'Aguardando resposta do assistente.'
  if (last.data === null) {
    return 'Não foi possível obter resposta. Você pode tentar de novo.'
  }
  return 'Resposta do assistente exibida abaixo.'
}

export default function ChatSection({ messages, onRelated, sessionId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = useState('')
  const prevSignature = useRef('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    const last = messages[messages.length - 1]
    const sig =
      last && last.type === 'ai'
        ? `${last.id}:${last.data === undefined ? 'wait' : last.data === null ? 'err' : 'ok'}`
        : ''
    if (sig === prevSignature.current) return
    prevSignature.current = sig
    const text = statusFromMessages(messages)
    if (text) setAnnouncement(text)
  }, [messages])

  return (
    <section
      className="max-w-2xl mx-auto px-5 pb-36 pt-7"
      aria-label="Histórico da conversa com o Guia Cidadão"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <div className="flex flex-col gap-3.5">
        {messages.map(msg => {
          if (msg.type === 'user') {
            return (
              <div
                key={msg.id}
                className="animate-msg-in self-end max-w-[80%] bg-gov-blue text-white text-sm font-medium px-4 py-3 rounded-2xl rounded-br-sm leading-relaxed"
                role="article"
                aria-label="Você perguntou"
              >
                {msg.text}
              </div>
            )
          }
          if (msg.data === undefined) {
            return (
              <div
                key={msg.id}
                className="self-start bg-white border border-gdf-border rounded-2xl rounded-tl-sm px-5 py-4"
                aria-hidden
              >
                <div className="flex gap-1 items-center">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                </div>
              </div>
            )
          }
          if (msg.data === null) {
            return (
              <DefaultMessage
                key={msg.id}
                onRelated={onRelated}
                responseId={`default_${msg.id}`}
                sessionId={sessionId}
              />
            )
          }
          return <AIMessage key={msg.id} data={msg.data} onRelated={onRelated} />
        })}
      </div>
      <div ref={bottomRef} aria-hidden />
    </section>
  )
}

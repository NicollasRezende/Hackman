import { useEffect, useRef } from 'react'
import AIMessage from './AIMessage'
import DefaultMessage from './DefaultMessage'
import type { Message } from '../../types'

interface Props {
  messages: Message[]
  onRelated: (q: string) => void
}

export default function ChatSection({ messages, onRelated }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="max-w-2xl mx-auto px-5 pb-36 pt-7">
      <div className="flex flex-col gap-3.5">
        {messages.map(msg => {
          if (msg.type === 'user') {
            return (
              <div key={msg.id} className="animate-msg-in self-end max-w-[80%] bg-verde text-white text-sm font-medium px-4 py-3 rounded-2xl rounded-br-sm leading-relaxed">
                {msg.text}
              </div>
            )
          }
          if (msg.data === undefined) {
            // typing indicator
            return (
              <div key={msg.id} className="self-start bg-white border border-gdf-border rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex gap-1 items-center">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-500" />
                </div>
              </div>
            )
          }
          if (msg.data === null) {
            return <DefaultMessage key={msg.id} onRelated={onRelated} />
          }
          return <AIMessage key={msg.id} data={msg.data} onRelated={onRelated} />
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

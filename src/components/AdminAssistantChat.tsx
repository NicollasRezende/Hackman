import { useState, useEffect, useCallback, useRef } from 'react'
import { Bot, X, SendHorizontal } from 'lucide-react'
import ChatSection from './Chat'
import type { Message } from '../types'

const ADMIN_SESSION_KEY = 'guia-cidadao-admin-ai-session'

function getAdminSessionId(): string {
  let id = sessionStorage.getItem(ADMIN_SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(ADMIN_SESSION_KEY, id)
  }
  return id
}

let msgSeq = 0
const nextId = () => `adm-${++msgSeq}`

function resolveApiBases(): string[] {
  const env = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL
  return [env, '/api', 'http://localhost:8080/api'].filter(
    (v, i, a): v is string => Boolean(v) && a.indexOf(v) === i,
  )
}

interface Props {
  /** Texto com métricas atuais do painel (JSON ou resumo) injetado antes da pergunta. */
  getMetricsContext: () => string
}

export default function AdminAssistantChat({ getMetricsContext }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const sessionIdRef = useRef<string | null>(null)
  if (sessionIdRef.current == null) {
    sessionIdRef.current = getAdminSessionId()
  }

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const context = getMetricsContext()
      const payloadText = `${context}\n\n---\n\nPergunta do administrador: ${trimmed}`

      const userMsg: Message = { id: nextId(), type: 'user', text: trimmed }
      const typingMsg: Message = { id: nextId(), type: 'ai', text: '', data: undefined }

      setMessages(prev => [...prev, userMsg, typingMsg])

      const bases = resolveApiBases()
      let data: Message['data'] = null

      for (const base of bases) {
        try {
          const res = await fetch(`${base}/v1/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: payloadText,
              sessionId: sessionIdRef.current,
            }),
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
        prev.map(m => (m.id === typingMsg.id ? { ...m, data: data ?? null } : m)),
      )
    },
    [getMetricsContext],
  )

  const panelId = 'admin-assistant-panel'
  const inputId = 'admin-assistant-input'

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    globalThis.window.addEventListener('keydown', onKey)
    return () => globalThis.window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-[5.5rem] z-[55] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/90 bg-gdf-dark text-white shadow-lg transition hover:bg-[#0a2a5c] focus:outline-none focus-visible:ring-2 focus-visible:ring-verde focus-visible:ring-offset-2 md:right-[5.75rem]"
        aria-expanded={open}
        aria-controls={panelId}
        title="Assistente de IA para interpretar métricas deste painel"
        aria-label={open ? 'Fechar assistente do administrador' : 'Abrir assistente de IA do administrador'}
      >
        {open ? <X size={22} aria-hidden /> : <Bot size={22} aria-hidden />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label="Assistente de IA para administradores"
          className="fixed inset-x-3 bottom-[4.5rem] z-[56] flex max-h-[min(520px,72vh)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl md:left-auto md:right-6 md:w-[min(100vw-3rem,440px)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-gdf-dark to-[#1351b4] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2">
              <Bot size={20} className="shrink-0 opacity-90" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Assistente do painel</p>
                <p className="truncate text-[11px] text-white/70">
                  Usa as métricas carregadas como contexto
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Fechar painel do assistente"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 [&>section]:max-w-none [&>section]:px-2 [&>section]:pb-4 [&>section]:pt-2">
            <ChatSection
              messages={messages}
              onRelated={send}
              sessionId={sessionIdRef.current ?? undefined}
            />
          </div>

          <form
            className="border-t border-slate-100 bg-white p-3"
            onSubmit={e => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const q = String(fd.get('q') ?? '')
              e.currentTarget.reset()
              void send(q)
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              Mensagem para o assistente
            </label>
            <div className="flex gap-2">
              <input
                id={inputId}
                name="q"
                autoComplete="off"
                placeholder="Ex.: Como explicar o ROI deste painel?"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-gdf-dark placeholder:text-slate-400 focus:border-verde/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-verde/25"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-xl bg-verde px-3 py-2 text-white shadow-sm transition hover:bg-gdf-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-verde focus-visible:ring-offset-2"
                aria-label="Enviar pergunta"
                title="Enviar"
              >
                <SendHorizontal size={20} aria-hidden />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                'O que é o proxy de filas evitadas?',
                'Como interpretar staleness no TCU?',
                'Resumo em 3 frases para o relatório.',
              ].map(sug => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => void send(sug)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-[11px] text-slate-600 transition hover:border-verde/30 hover:bg-verde-light/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/30"
                >
                  {sug}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  )
}

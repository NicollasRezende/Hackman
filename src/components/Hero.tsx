import { useRef, useState, useEffect } from 'react'
import { Mic, Search, Square, TrendingUp } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { CHIPS, SUGGESTIONS } from '../data/services'

const VOICE_DEMOS = [
  'tô precisando de um médico',
  'fui demitido essa semana, e agora?',
  'quero me inscrever no Bolsa Família',
  'como emitir segunda via do RG?',
]

interface HeroProps {
  compact: boolean
  onSend: (text: string) => void
}

export default function Hero({ compact, onSend }: HeroProps) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recording, setRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
    setShowSuggestions(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    if (recording) {
      setRecording(false)
      return
    }
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      setValue(VOICE_DEMOS[Math.floor(Math.random() * VOICE_DEMOS.length)])
    }, 2200)
  }

  return (
    <section className={`border-b border-gov-blue-line bg-white transition-all duration-500 ${compact ? 'px-6 py-8' : 'px-6 py-12 md:py-16'}`}>
      <div className="mx-auto max-w-6xl" ref={wrapperRef}>
        {!compact && (
          <div className="mb-10">
            <p className="text-[2.75rem] font-light tracking-[-0.04em] text-gov-text md:text-[3.25rem]">
              Serviços para você
            </p>
          </div>
        )}

        <div className="relative">
          <div className="rounded-sm border border-[#d6d6d6] bg-white p-4 shadow-[0_4px_18px_rgba(15,35,95,0.12)]">
            <div className="relative border border-[#c8c8c8] bg-white">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => setShowSuggestions(true)}
                placeholder="O que você procura?"
                rows={1}
                className="w-full resize-none border-none bg-transparent px-7 py-5 pr-28 text-[1.05rem] italic leading-relaxed text-gov-text outline-none placeholder:text-[#6c757d]"
              />
              <div className="absolute right-5 top-1/2 flex -translate-y-1/2 gap-4">
                <button
                  onClick={handleVoice}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    recording ? 'bg-red-50 text-red-600 recording' : 'text-gov-blue hover:text-gov-blue-dark'
                  }`}
                >
                  {recording ? <Square size={15} /> : <Mic size={15} />}
                </button>
                <button
                  onClick={handleSend}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gov-blue transition-colors hover:text-gov-blue-dark"
                >
                  <Search size={22} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>

          {showSuggestions && (
            <div className="absolute left-4 right-4 top-full z-50 mt-2 overflow-hidden rounded-sm border border-gov-blue-line bg-white shadow-xl">
              <div className="px-4 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-widest text-gov-muted">
                Mais buscados hoje
              </div>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button
                  key={s.query}
                  onClick={() => { onSend(s.query); setShowSuggestions(false) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gov-text transition-colors hover:bg-gov-blue-soft"
                >
                  <TrendingUp size={13} className="shrink-0 text-gov-blue" />
                  {s.label}
                </button>
              ))}
              <div className="my-1 h-px bg-gov-blue-line/70" />
              <div className="px-4 pb-1.5 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-gov-muted">
                Sugestões
              </div>
              {SUGGESTIONS.slice(3).map(s => {
                const Icon = getIcon(s.icon) ?? TrendingUp
                return (
                  <button
                    key={s.query}
                    onClick={() => { onSend(s.query); setShowSuggestions(false) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gov-text transition-colors hover:bg-gov-blue-soft"
                  >
                    <Icon size={13} className="shrink-0 text-gov-muted" />
                    {s.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {!compact && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gov-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 animate-blink" />
            <span>1.247 consultas respondidas hoje</span>
            <span className="text-gov-blue-line">·</span>
            <span>Tempo médio: 4 segundos</span>
            <span className="hidden text-gov-blue-line sm:block">·</span>
            <span className="hidden sm:block">Atualizado às 09:15 de 11/04/2026</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CHIPS.map(c => {
            const Icon = getIcon(c.icon) ?? TrendingUp
            return (
              <button key={c.label} onClick={() => onSend(c.query)} className="chip">
                <Icon size={12} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

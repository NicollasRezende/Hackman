import { useRef, useState, useEffect } from 'react'
<<<<<<< HEAD
import { Mic, Search, Square, TrendingUp } from 'lucide-react'
=======
import { Sparkles, Mic, ArrowUp, Square, TrendingUp } from 'lucide-react'
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
  // Auto-resize textarea
>>>>>>> origin/main
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [value])

<<<<<<< HEAD
=======
  // Close suggestions on outside click
>>>>>>> origin/main
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
<<<<<<< HEAD
    if (recording) {
      setRecording(false)
      return
    }
=======
    if (recording) { setRecording(false); return }
>>>>>>> origin/main
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      setValue(VOICE_DEMOS[Math.floor(Math.random() * VOICE_DEMOS.length)])
    }, 2200)
  }

  return (
<<<<<<< HEAD
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
=======
    <section
      className={`bg-gradient-to-b from-verde-dim to-white border-b border-verde-light text-center transition-all duration-500 ${
        compact ? 'py-7 px-6' : 'py-16 px-6'
      }`}
    >
      {!compact && (
        <>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-verde-med bg-verde-light border border-verde-light px-4 py-1.5 rounded-full mb-5">
            <Sparkles size={12} />
            Assistente com Inteligência Artificial
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            Como podemos <span className="text-verde">ajudar você</span> hoje?
          </h1>
          <p className="text-sm md:text-base text-[#6B8B73] max-w-md mx-auto mb-9 leading-relaxed">
            Serviços do GDF, documentos e agendamentos — em linguagem simples, sem burocracia.
          </p>
        </>
      )}

      <div className="max-w-2xl mx-auto" ref={wrapperRef}>
        {/* Search box */}
        <div className="relative">
          <div className="relative bg-white border-[1.5px] border-gdf-border rounded-2xl shadow-[0_4px_16px_rgba(0,102,51,.08)] focus-within:border-verde focus-within:shadow-[0_0_0_3px_rgba(0,132,61,.1)] transition-all">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setShowSuggestions(true)}
              placeholder='Ex: "perdi meu emprego", "quero me aposentar", "preciso de médico"'
              rows={1}
              className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-[#6B8B73] px-5 pt-[18px] pb-[18px] pr-28 resize-none leading-relaxed"
            />
            <div className="absolute right-2 bottom-2 flex gap-1.5">
              <button
                onClick={handleVoice}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                  recording
                    ? 'border-red-600 text-red-600 bg-red-50 recording'
                    : 'border-gdf-border text-[#6B8B73] bg-gdf-soft hover:border-verde hover:text-verde hover:bg-verde-dim'
                }`}
              >
                {recording ? <Square size={15} /> : <Mic size={15} />}
              </button>
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-verde text-white flex items-center justify-center hover:bg-verde-med transition-all shadow-sm hover:shadow-verde/25"
              >
                <ArrowUp size={17} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gdf-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#6B8B73] px-4 pt-3 pb-1.5">
>>>>>>> origin/main
                Mais buscados hoje
              </div>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button
                  key={s.query}
                  onClick={() => { onSend(s.query); setShowSuggestions(false) }}
<<<<<<< HEAD
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gov-text transition-colors hover:bg-gov-blue-soft"
                >
                  <TrendingUp size={13} className="shrink-0 text-gov-blue" />
                  {s.label}
                </button>
              ))}
              <div className="my-1 h-px bg-gov-blue-line/70" />
              <div className="px-4 pb-1.5 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-gov-muted">
=======
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gdf-soft text-[#3D5445] text-sm text-left transition-colors"
                >
                  <TrendingUp size={13} className="text-[#6B8B73] flex-shrink-0" />
                  {s.label}
                </button>
              ))}
              <div className="h-px bg-gdf-border/50 my-1" />
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#6B8B73] px-4 pt-1.5 pb-1.5">
>>>>>>> origin/main
                Sugestões
              </div>
              {SUGGESTIONS.slice(3).map(s => {
                const Icon = getIcon(s.icon) ?? TrendingUp
                return (
                  <button
                    key={s.query}
                    onClick={() => { onSend(s.query); setShowSuggestions(false) }}
<<<<<<< HEAD
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gov-text transition-colors hover:bg-gov-blue-soft"
                  >
                    <Icon size={13} className="shrink-0 text-gov-muted" />
=======
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gdf-soft text-[#3D5445] text-sm text-left transition-colors"
                  >
                    <Icon size={13} className="text-[#6B8B73] flex-shrink-0" />
>>>>>>> origin/main
                    {s.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

<<<<<<< HEAD
        {!compact && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gov-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 animate-blink" />
            <span>1.247 consultas respondidas hoje</span>
            <span className="text-gov-blue-line">·</span>
            <span>Tempo médio: 4 segundos</span>
            <span className="hidden text-gov-blue-line sm:block">·</span>
=======
        {/* Live stats */}
        {!compact && (
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[#6B8B73]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-blink flex-shrink-0" />
            <span>1.247 consultas respondidas hoje</span>
            <span className="text-gdf-border">·</span>
            <span>Tempo médio: 4 segundos</span>
            <span className="text-gdf-border hidden sm:block">·</span>
>>>>>>> origin/main
            <span className="hidden sm:block">Atualizado às 09:15 de 11/04/2026</span>
          </div>
        )}

<<<<<<< HEAD
        <div className="mt-6 flex flex-wrap justify-center gap-2">
=======
        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-4">
>>>>>>> origin/main
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

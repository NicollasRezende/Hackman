import { useRef, useEffect, useState } from 'react'
import { Mic, ArrowUp, Square } from 'lucide-react'

const VOICE_DEMOS = [
  'tô precisando de um médico',
  'fui demitido essa semana, e agora?',
  'quero me inscrever no Bolsa Família',
  'como emitir segunda via do RG?',
]

interface Props { onSend: (text: string) => void }

export default function BottomBar({ onSend }: Props) {
  const [value, setValue] = useState('')
  const [recording, setRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [value])

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    if (recording) { setRecording(false); return }
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      setValue(VOICE_DEMOS[Math.floor(Math.random() * VOICE_DEMOS.length)])
    }, 2200)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 px-5">
      <div className="max-w-2xl mx-auto">
        <div className="relative bg-white border-[1.5px] border-gdf-border rounded-2xl shadow-lg focus-within:border-verde focus-within:shadow-[0_0_0_3px_rgba(0,132,61,.1)] transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Continue a conversa..."
            rows={1}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-[#6B8B73] px-5 pt-4 pb-4 pr-28 resize-none leading-relaxed"
          />
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            <button
              onClick={handleVoice}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                recording
                  ? 'border-red-600 text-red-600 bg-red-50 recording'
                  : 'border-gdf-border text-[#6B8B73] bg-gdf-soft hover:border-verde hover:text-verde'
              }`}
            >
              {recording ? <Square size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-xl bg-verde text-white flex items-center justify-center hover:bg-verde-med transition-all"
            >
              <ArrowUp size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

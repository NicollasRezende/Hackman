import { useRef, useEffect, useState, useId } from 'react'
import { Mic, ArrowUp, Square } from 'lucide-react'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { BOTTOM_CHAT_INPUT_ID } from '../../a11y/constants'

interface Props {
  onSend: (text: string) => void
}

export default function BottomBar({ onSend }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hintId = useId()

  const { recording, supported: micSupported, toggle: toggleMic } = useSpeechRecognition({
    onResult(text) {
      setValue(text)
    },
  })

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

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 px-5"
      role="region"
      aria-label="Campo para continuar a conversa"
    >
      <div className="max-w-2xl mx-auto">
        <label htmlFor={BOTTOM_CHAT_INPUT_ID} className="sr-only">
          Mensagem para o assistente do Guia Cidadão
        </label>
        <p id={hintId} className="sr-only">
          Enter envia a mensagem. Shift+Enter quebra linha.
        </p>
        <div className="relative bg-white border-[1.5px] border-gdf-border rounded-2xl shadow-lg focus-within:border-verde focus-within:shadow-[0_0_0_3px_rgba(38,112,232,.18)] transition-all">
          <textarea
            id={BOTTOM_CHAT_INPUT_ID}
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Continue a conversa..."
            rows={1}
            aria-describedby={hintId}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500 px-5 pt-4 pb-4 pr-28 resize-none leading-relaxed"
          />
          <div className="absolute right-2 bottom-2 flex gap-1.5">
            {micSupported && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={recording ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
                aria-pressed={recording}
                className={`min-h-11 min-w-11 md:min-h-0 md:min-w-0 w-11 h-11 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all border ${
                  recording
                    ? 'border-red-600 text-red-600 bg-red-50 recording'
                    : 'border-gdf-border text-gray-600 bg-gdf-soft hover:border-verde hover:text-verde'
                }`}
              >
                {recording ? <Square size={14} aria-hidden /> : <Mic size={14} aria-hidden />}
              </button>
            )}
            <button
              type="button"
              onClick={handleSend}
              className="min-h-11 min-w-11 md:min-h-0 md:min-w-0 w-11 h-11 md:w-10 md:h-10 rounded-xl bg-verde text-white flex items-center justify-center hover:bg-verde-med transition-all"
              aria-label="Enviar mensagem ao assistente"
            >
              <ArrowUp size={17} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useRef, useState, useCallback, useEffect } from 'react'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface UseSpeechRecognitionOptions {
  lang?: string
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

const getSpeechRecognitionClass = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition({
  lang = 'pt-BR',
  onResult,
  onError,
}: UseSpeechRecognitionOptions) {
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const supported = getSpeechRecognitionClass() !== null

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const toggle = useCallback(() => {
    // Stop if currently recording
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    const SpeechRecognitionClass = getSpeechRecognitionClass()
    if (!SpeechRecognitionClass) {
      onError?.('Reconhecimento de voz não suportado neste navegador.')
      return
    }

    const recognition = new SpeechRecognitionClass()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecording(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) {
        onResult(transcript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are normal user actions, not real errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError?.(event.error === 'not-allowed'
          ? 'Permissão de microfone negada. Habilite nas configurações do navegador.'
          : `Erro de reconhecimento: ${event.error}`)
      }
      setRecording(false)
    }

    recognition.onend = () => {
      setRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [recording, lang, onResult, onError])

  return { recording, supported, toggle }
}

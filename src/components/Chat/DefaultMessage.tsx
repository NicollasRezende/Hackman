import { useId, useState, useCallback } from 'react'
import { Bot, ThumbsUp, ThumbsDown, Lightbulb, MessageCircle, Megaphone, AlertTriangle, FileSearch, MessageSquare } from 'lucide-react'
import { sendFeedback, type FeedbackVote } from '../../services/feedback'
import { useAccessibility } from '../../contexts/AccessibilityContext'

const POPULAR = [
  { label: 'Consulta médica', query: 'como agendar consulta médica' },
  { label: 'Seguro-desemprego', query: 'fui demitido, o que faço?' },
  { label: 'Aposentadoria', query: 'quero me aposentar' },
  { label: 'Segunda via do RG', query: 'como emitir segunda via do RG?' },
]

const OUVIDORIA_URL = 'https://portal.tcu.gov.br/ouvidoria'

const MANIFESTACOES = [
  { label: 'Denúncia de irregularidade', icon: AlertTriangle, url: OUVIDORIA_URL },
  { label: 'Reclamação de serviço', icon: MessageSquare, url: OUVIDORIA_URL },
  { label: 'Pedido de informação (LAI)', icon: FileSearch, url: OUVIDORIA_URL },
  { label: 'Sugestão ou elogio', icon: Megaphone, url: OUVIDORIA_URL },
]

interface Props {
  onRelated: (q: string) => void
  responseId: string
  sessionId?: string
}

export default function DefaultMessage({ onRelated, responseId, sessionId }: Props) {
  const { announce } = useAccessibility()
  const [feedback, setFeedback] = useState<'pos' | 'neg' | null>(null)
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackError, setFeedbackError] = useState(false)
  const titleId = useId()
  const feedbackLabelId = useId()

  const submitFeedback = useCallback(
    async (choice: 'pos' | 'neg') => {
      if (feedbackSending || feedbackSent) return
      setFeedback(choice)
      setFeedbackSending(true)
      setFeedbackError(false)
      const vote: FeedbackVote = choice === 'pos' ? 'positive' : 'negative'
      const ok = await sendFeedback(responseId, sessionId, vote)
      setFeedbackSending(false)
      if (ok) {
        setFeedbackSent(true)
        announce(
          choice === 'pos'
            ? 'Obrigado! Seu retorno foi registrado.'
            : 'Retorno registrado. Vamos melhorar esta orientação.',
        )
      } else {
        setFeedbackError(true)
        setFeedback(null)
        announce('Não foi possível registrar seu retorno. Tente novamente.')
      }
    },
    [responseId, sessionId, feedbackSending, feedbackSent, announce],
  )

  return (
    <article
      className="animate-msg-in self-start max-w-full bg-white border border-gdf-border rounded-tl rounded-2xl overflow-hidden"
      aria-labelledby={titleId}
    >
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gdf-border">
          <div className="w-8 h-8 rounded-lg bg-gov-blue-light text-gov-blue flex items-center justify-center" aria-hidden>
            <Bot size={17} />
          </div>
          <div>
            <h2 id={titleId} className="text-sm font-bold text-gov-blue m-0 leading-none">
              Guia Cidadão IA · GOV.BR
            </h2>
            <p className="text-[11px] text-gray-600 mt-0.5 m-0">Assistente oficial de serviços públicos</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3 m-0">
          Entendi que você precisa de ajuda. Para te direcionar para o serviço certo, me conta um pouco mais:
        </p>

        <ol className="flex flex-col gap-2 mb-3 m-0 pl-5">
          {[
            'É sobre saúde, consulta médica ou atendimento de urgência?',
            'É sobre trabalho, renda, benefício ou previdência?',
            'Precisa de algum documento, licença ou agendamento?',
          ].map(s => (
            <li key={s} className="text-sm text-gray-700 leading-snug">
              {s}
            </li>
          ))}
        </ol>

        <div className="flex gap-2 items-start mt-3 p-3 bg-ouro-bg border border-ouro-border rounded-xl text-sm text-yellow-800">
          <Lightbulb size={14} className="text-ouro-DEFAULT flex-shrink-0 mt-0.5" aria-hidden />
          <p className="m-0">Ou clique em uma das categorias abaixo para ir direto ao serviço.</p>
        </div>

        {/* Ouvidoria — escalada quando a IA não resolve */}
        <div className="mt-3 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl" role="complementary" aria-label="Registrar manifestação na Ouvidoria">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone size={13} className="text-indigo-600 flex-shrink-0" aria-hidden />
            <p className="text-xs font-bold text-indigo-800 m-0">Não encontrou o que precisava?</p>
          </div>
          <p className="text-[11px] text-indigo-700 m-0 mb-3 leading-snug">
            Registre uma manifestação na Ouvidoria — denúncia, reclamação ou pedido de informação (Lei 13.460/2017).
          </p>
          <nav className="flex flex-wrap gap-1.5" aria-label="Tipos de manifestação">
            {MANIFESTACOES.map(({ label, icon: Icon, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1.5 rounded-full hover:bg-indigo-100 hover:border-indigo-400 transition-all"
                aria-label={`${label} (abre Ouvidoria TCU em nova aba)`}
              >
                <Icon size={10} aria-hidden /> {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-5 pt-4 border-t border-gdf-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 flex-1" id={feedbackLabelId}>
              {feedbackSent
                ? 'Obrigado pelo retorno!'
                : feedbackSending
                  ? 'Registrando seu retorno…'
                  : 'Isso te ajudou?'}
            </span>
            <button
              type="button"
              onClick={() => void submitFeedback('pos')}
              disabled={feedbackSending || feedbackSent}
              aria-pressed={feedback === 'pos'}
              aria-describedby={feedbackLabelId}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:cursor-not-allowed disabled:opacity-80 ${
                feedback === 'pos'
                  ? 'bg-verde-light border-verde text-verde'
                  : 'bg-white border-gdf-border text-gray-600 hover:border-verde hover:text-verde'
              }`}
            >
              <ThumbsUp size={12} aria-hidden /> Sim
            </button>
            <button
              type="button"
              onClick={() => void submitFeedback('neg')}
              disabled={feedbackSending || feedbackSent}
              aria-pressed={feedback === 'neg'}
              aria-describedby={feedbackLabelId}
              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:cursor-not-allowed disabled:opacity-80 ${
                feedback === 'neg'
                  ? 'bg-red-50 border-red-400 text-red-600'
                  : 'bg-white border-gdf-border text-gray-600 hover:border-red-400 hover:text-red-600'
              }`}
            >
              <ThumbsDown size={12} aria-hidden /> Não
            </button>
          </div>
          {feedbackError && (
            <p className="text-[11px] text-red-600 mt-2 m-0" role="alert">
              Não foi possível registrar seu retorno. Tente novamente.
            </p>
          )}
        </div>
      </div>

      <div className="bg-gdf-soft border-t border-gdf-border px-5 py-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2.5 m-0">
          Serviços populares
        </p>
        <nav className="flex flex-wrap gap-1.5" aria-label="Perguntas sugeridas">
          {POPULAR.map(p => (
            <button
              key={p.query}
              type="button"
              onClick={() => onRelated(p.query)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-800 bg-white border border-gdf-border px-3 py-1.5 rounded-full hover:bg-gov-blue-light hover:border-gov-blue hover:text-gov-blue transition-all"
              aria-label={`Perguntar: ${p.label}`}
            >
              <MessageCircle size={11} aria-hidden /> {p.label}
            </button>
          ))}
        </nav>
      </div>
    </article>
  )
}

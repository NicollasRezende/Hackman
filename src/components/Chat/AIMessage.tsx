import { useId, useState, useCallback, useMemo } from 'react'
import {
  Bot, ThumbsUp, ThumbsDown, Lightbulb, Paperclip,
  ExternalLink, Share2, MessageCircle, MapPin, Phone, Clock, Building2,
} from 'lucide-react'
import { getIcon } from '../../utils/icon'
import type { AIResponse } from '../../types'
import LocationsMap from './LocationsMap'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { sendFeedback, type FeedbackVote } from '../../services/feedback'

const TAG_STYLES: Record<string, string> = {
  'tag-work': 'bg-amber-50 text-amber-700',
  'tag-health': 'bg-red-50 text-red-700',
  'tag-social': 'bg-gov-blue-light text-gov-blue',
  'tag-transit': 'bg-blue-50 text-blue-700',
  'tag-tcu': 'bg-indigo-50 text-indigo-700',
  'tag-mulher': 'bg-pink-50 text-pink-700',
}

interface Props {
  data: AIResponse
  onRelated: (q: string) => void
}

export default function AIMessage({ data, onRelated }: Props) {
  const { announce } = useAccessibility()
  const [feedback, setFeedback] = useState<'pos' | 'neg' | null>(null)
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackError, setFeedbackError] = useState(false)
  const titleId = useId()
  const stepsId = useId()
  const feedbackLabelId = useId()

  const submitFeedback = useCallback(
    async (choice: 'pos' | 'neg') => {
      if (feedbackSending || feedbackSent) return
      const responseId = data.meta?.responseId
      if (!responseId) {
        setFeedback(choice)
        announce('Obrigado pelo retorno.')
        setFeedbackSent(true)
        return
      }
      setFeedback(choice)
      setFeedbackSending(true)
      setFeedbackError(false)
      const vote: FeedbackVote = choice === 'pos' ? 'positive' : 'negative'
      const ok = await sendFeedback(responseId, data.meta?.sessionId, vote)
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
    [data.meta?.responseId, data.meta?.sessionId, feedbackSending, feedbackSent, announce],
  )

  const TagIcon = getIcon(data.tag.icon)

  const plainSummary = useMemo(
    () =>
      [
        data.intro.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        ...data.steps.map(s => s.replace(/<[^>]+>/g, ' ').trim()),
      ]
        .filter(Boolean)
        .join(' '),
    [data.intro, data.steps],
  )

  const handleShare = useCallback(async () => {
    const text = plainSummary
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Guia Cidadão', text })
        announce('Conteúdo compartilhado.')
        return
      } catch {
        /* cancelado ou indisponível */
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      announce('Texto copiado para a área de transferência.')
    } catch {
      announce('Não foi possível copiar. Selecione o texto manualmente.')
    }
  }, [plainSummary, announce])

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
              Guia Cidadão IA · GDF
            </h2>
            <p className="text-[11px] text-gray-600 mt-0.5 m-0">Assistente oficial de serviços públicos</p>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 ${TAG_STYLES[data.tag.cls] ?? TAG_STYLES['tag-social']}`}
        >
          {TagIcon && <TagIcon size={12} aria-hidden />}
          {data.tag.txt}
        </div>

        <div
          className="text-sm text-gray-700 mb-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.intro }}
        />

        {data.blocks.map((b, blockIndex) => {
          const BIcon = getIcon(b.icon)
          return (
            <section
              key={`${b.title}-${blockIndex}`}
              className="bg-gdf-soft border border-gdf-border rounded-xl p-3.5 my-2.5"
              aria-label={b.title}
            >
              <h3 className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2 m-0">
                {BIcon && <BIcon size={12} aria-hidden />}
                {b.title}
              </h3>
              {b.docs ? (
                <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
                  {b.docs.map(d => (
                    <li
                      key={d}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white border border-gdf-border rounded-md text-gray-800"
                    >
                      <Paperclip size={11} className="text-gray-500" aria-hidden /> {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: b.body ?? '' }}
                />
              )}
            </section>
          )
        })}

        <p id={stepsId} className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mt-4 mb-2 m-0">
          Passo a passo
        </p>
        <ol className="flex flex-col gap-2 m-0 p-0 list-none" aria-labelledby={stepsId}>
          {data.steps.map((s, i) => (
            <li key={`${i}-${s.slice(0, 40)}`} className="flex items-start gap-2.5 text-sm">
              <span className="min-w-[22px] h-[22px] rounded-md bg-gov-blue text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0" aria-hidden>
                {i + 1}
              </span>
              <span className="leading-snug text-gray-700" dangerouslySetInnerHTML={{ __html: s }} />
            </li>
          ))}
        </ol>

        {data.tip && (
          <div className="flex gap-2.5 items-start mt-3 p-3 bg-ouro-bg border border-ouro-border rounded-xl text-sm text-yellow-800">
            <Lightbulb size={14} className="text-ouro-DEFAULT flex-shrink-0 mt-0.5" aria-hidden />
            <p className="m-0">{data.tip}</p>
          </div>
        )}

        {data.contact && (
          <section className="bg-gdf-soft border border-gdf-border rounded-xl p-3.5 mt-3" aria-label="Atendimento presencial">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2.5 m-0">
              Onde ir presencialmente
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: Building2, text: data.contact.title },
                { icon: MapPin, text: data.contact.addr },
                { icon: Phone, text: data.contact.phone },
                { icon: Clock, text: data.contact.hours },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2 text-sm text-gray-800">
                  <Icon size={13} className="text-gov-blue flex-shrink-0 mt-0.5" aria-hidden />
                  {text}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.locations && data.locations.length > 0 && (
          <LocationsMap locations={data.locations} />
        )}

        {data.provenance && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1 font-semibold bg-gdf-soft border border-gdf-border px-2 py-0.5 rounded-md">
              Fonte: {data.provenance.source}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold bg-gdf-soft border border-gdf-border px-2 py-0.5 rounded-md">
              Atualizado em {data.provenance.updatedAt}
            </span>
            {data.provenance.referenceUrl && (
              <a
                href={data.provenance.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-verde hover:text-verde-med"
              >
                ver origem
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap mt-4">
          {(() => {
            const officialUrl = data.official?.url ?? 'https://www.df.gov.br'
            const officialLabel = data.official?.label ?? 'Acessar serviço oficial'
            const officialHost = (() => {
              try {
                return new URL(officialUrl).host
              } catch {
                return 'df.gov.br'
              }
            })()
            return (
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold bg-gov-blue text-white px-4 py-2.5 rounded-xl hover:bg-gov-blue-dark transition-all shadow-sm"
              >
                <ExternalLink size={14} aria-hidden /> {officialLabel}
                <span className="sr-only"> (abre {officialHost} em nova aba)</span>
              </a>
            )
          })()}
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-gov-blue border-[1.5px] border-gov-blue px-3.5 py-2.5 rounded-xl hover:bg-gov-blue-light transition-all"
            aria-label="Compartilhar ou copiar resumo desta orientação"
          >
            <Share2 size={13} aria-hidden /> Compartilhar
          </button>
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
                  ? 'bg-gov-blue-light border-gov-blue text-gov-blue'
                  : 'bg-white border-gdf-border text-gray-600 hover:border-gov-blue hover:text-gov-blue hover:bg-gov-blue-light'
              }`}
            >
              <ThumbsUp size={12} aria-hidden /> Sim, ajudou
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
                  : 'bg-white border-gdf-border text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <ThumbsDown size={12} aria-hidden /> Não funcionou
            </button>
          </div>
          {feedbackError && (
            <p className="text-[11px] text-red-600 mt-2 m-0" role="alert">
              Não foi possível registrar seu retorno. Tente novamente.
            </p>
          )}
        </div>
      </div>

      {data.related && data.related.length > 0 && (
        <div className="bg-gdf-soft border-t border-gdf-border px-5 py-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2.5 m-0">
            Você também pode perguntar
          </p>
          <nav className="flex flex-wrap gap-1.5" aria-label="Perguntas relacionadas">
            {data.related.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onRelated(r)}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-800 bg-white border border-gdf-border px-3 py-1.5 rounded-full hover:bg-gov-blue-light hover:border-gov-blue hover:text-gov-blue transition-all"
                aria-label={`Perguntar: ${r}`}
              >
                <MessageCircle size={11} aria-hidden /> {r}
              </button>
            ))}
          </nav>
        </div>
      )}
    </article>
  )
}

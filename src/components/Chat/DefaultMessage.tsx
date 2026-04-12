import { useId, useState } from 'react'
import { Bot, ThumbsUp, ThumbsDown, Lightbulb, MessageCircle } from 'lucide-react'

const POPULAR = [
  { label: 'Consulta médica', query: 'como agendar consulta médica' },
  { label: 'Seguro-desemprego', query: 'fui demitido, o que faço?' },
  { label: 'Aposentadoria', query: 'quero me aposentar' },
  { label: 'Segunda via do RG', query: 'como emitir segunda via do RG?' },
]

interface Props {
  onRelated: (q: string) => void
}

export default function DefaultMessage({ onRelated }: Props) {
  const [feedback, setFeedback] = useState<'pos' | 'neg' | null>(null)
  const titleId = useId()
  const feedbackLabelId = useId()

  return (
    <article
      className="animate-msg-in self-start max-w-full bg-white border border-gdf-border rounded-tl rounded-2xl overflow-hidden"
      aria-labelledby={titleId}
    >
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gdf-border">
          <div className="w-8 h-8 rounded-lg bg-verde-light text-verde flex items-center justify-center" aria-hidden>
            <Bot size={17} />
          </div>
          <div>
            <h2 id={titleId} className="text-sm font-bold text-verde m-0 leading-none">
              Guia Cidadão IA · GDF
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

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gdf-border">
          <span className="text-xs text-gray-600 flex-1" id={feedbackLabelId}>
            Isso te ajudou?
          </span>
          <button
            type="button"
            onClick={() => setFeedback('pos')}
            aria-pressed={feedback === 'pos'}
            aria-describedby={feedbackLabelId}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              feedback === 'pos'
                ? 'bg-verde-light border-verde text-verde'
                : 'bg-white border-gdf-border text-gray-600 hover:border-verde hover:text-verde'
            }`}
          >
            <ThumbsUp size={12} aria-hidden /> Sim
          </button>
          <button
            type="button"
            onClick={() => setFeedback('neg')}
            aria-pressed={feedback === 'neg'}
            aria-describedby={feedbackLabelId}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              feedback === 'neg'
                ? 'bg-red-50 border-red-400 text-red-600'
                : 'bg-white border-gdf-border text-gray-600 hover:border-red-400 hover:text-red-600'
            }`}
          >
            <ThumbsDown size={12} aria-hidden /> Não
          </button>
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
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-800 bg-white border border-gdf-border px-3 py-1.5 rounded-full hover:bg-verde-light hover:border-verde hover:text-verde transition-all"
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

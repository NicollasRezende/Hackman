import { useState } from 'react'
import { Bot, ThumbsUp, ThumbsDown, Lightbulb, MessageCircle } from 'lucide-react'

const POPULAR = [
  { label: 'Consulta médica', query: 'como agendar consulta médica' },
  { label: 'Seguro-desemprego', query: 'fui demitido, o que faço?' },
  { label: 'Aposentadoria', query: 'quero me aposentar' },
  { label: 'Segunda via do RG', query: 'como emitir segunda via do RG?' },
]

interface Props { onRelated: (q: string) => void }

export default function DefaultMessage({ onRelated }: Props) {
  const [feedback, setFeedback] = useState<'pos' | 'neg' | null>(null)

  return (
    <div className="animate-msg-in self-start max-w-full bg-white border border-gdf-border rounded-tl rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#EAF2ED]">
          <div className="w-8 h-8 rounded-lg bg-verde-light text-verde flex items-center justify-center">
            <Bot size={17} />
          </div>
          <div>
            <div className="text-sm font-bold text-verde">Guia Cidadão IA · GDF</div>
            <div className="text-[11px] text-[#6B8B73]">Assistente oficial de serviços públicos</div>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-3">
          Entendi que você precisa de ajuda. Para te direcionar para o serviço certo, me conta um pouco mais:
        </p>

        <ol className="flex flex-col gap-2 mb-3">
          {['É sobre saúde, consulta médica ou atendimento de urgência?', 'É sobre trabalho, renda, benefício ou previdência?', 'Precisa de algum documento, licença ou agendamento?'].map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="min-w-[22px] h-[22px] rounded-md bg-verde text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">?</span>
              <span className="text-gray-700 leading-snug">{s}</span>
            </li>
          ))}
        </ol>

        <div className="flex gap-2 items-start mt-3 p-3 bg-ouro-bg border border-ouro-border rounded-xl text-sm text-yellow-800">
          <Lightbulb size={14} className="text-ouro-DEFAULT flex-shrink-0 mt-0.5" />
          <span>Ou clique em uma das categorias abaixo para ir direto ao serviço.</span>
        </div>

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#EAF2ED]">
          <span className="text-xs text-[#6B8B73] flex-1">Isso te ajudou?</span>
          <button onClick={() => setFeedback('pos')} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${feedback === 'pos' ? 'bg-verde-light border-verde text-verde' : 'bg-white border-gdf-border text-[#6B8B73] hover:border-verde hover:text-verde'}`}>
            <ThumbsUp size={12} /> Sim
          </button>
          <button onClick={() => setFeedback('neg')} className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${feedback === 'neg' ? 'bg-red-50 border-red-400 text-red-600' : 'bg-white border-gdf-border text-[#6B8B73] hover:border-red-400 hover:text-red-600'}`}>
            <ThumbsDown size={12} /> Não
          </button>
        </div>
      </div>

      <div className="bg-gdf-soft border-t border-gdf-border px-5 py-4">
        <div className="text-[10px] font-bold tracking-widest uppercase text-[#6B8B73] mb-2.5">Serviços populares</div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR.map(p => (
            <button key={p.query} onClick={() => onRelated(p.query)} className="inline-flex items-center gap-1 text-xs font-medium text-[#3D5445] bg-white border border-gdf-border px-3 py-1.5 rounded-full hover:bg-verde-light hover:border-verde hover:text-verde transition-all">
              <MessageCircle size={11} /> {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

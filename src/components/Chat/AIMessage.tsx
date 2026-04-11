import { useState } from 'react'
import {
  Bot, ThumbsUp, ThumbsDown, Lightbulb, Paperclip,
  ExternalLink, Share2, MessageCircle, MapPin, Phone, Clock, Building2,
} from 'lucide-react'
import { getIcon } from '../../utils/icon'
import type { AIResponse } from '../../types'
import LocationsMap from './LocationsMap'

const TAG_STYLES: Record<string, string> = {
  'tag-work':    'bg-amber-50 text-amber-700',
  'tag-health':  'bg-red-50 text-red-700',
  'tag-social':  'bg-verde-light text-verde',
  'tag-transit': 'bg-blue-50 text-blue-700',
  'tag-tcu':     'bg-indigo-50 text-indigo-700',
}

interface Props {
  data: AIResponse
  onRelated: (q: string) => void
}

export default function AIMessage({ data, onRelated }: Props) {
  const [feedback, setFeedback] = useState<'pos' | 'neg' | null>(null)

  const TagIcon = getIcon(data.tag.icon)

  return (
    <div className="animate-msg-in self-start max-w-full bg-white border border-gdf-border rounded-tl rounded-2xl overflow-hidden">
      {/* Body */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gdf-border">
          <div className="w-8 h-8 rounded-lg bg-verde-light text-verde flex items-center justify-center">
            <Bot size={17} />
          </div>
          <div>
            <div className="text-sm font-bold text-verde leading-none">Guia Cidadão IA · GDF</div>
            <div className="text-[11px] text-gray-600 mt-0.5">Assistente oficial de serviços públicos</div>
          </div>
        </div>

        {/* Tag */}
        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 ${TAG_STYLES[data.tag.cls] ?? TAG_STYLES['tag-social']}`}>
          {TagIcon && <TagIcon size={12} />}
          {data.tag.txt}
        </div>

        {/* Intro */}
        <p className="text-sm text-gray-700 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.intro }} />

        {/* Info blocks */}
        {data.blocks.map((b, i) => {
          const BIcon = getIcon(b.icon)
          return (
            <div key={i} className="bg-gdf-soft border border-gdf-border rounded-xl p-3.5 my-2.5">
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2">
                {BIcon && <BIcon size={12} />}
                {b.title}
              </h4>
              {b.docs ? (
                <div className="flex flex-wrap gap-1.5">
                  {b.docs.map(d => (
                    <span key={d} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white border border-gdf-border rounded-md text-gray-800">
                      <Paperclip size={11} className="text-gray-500" /> {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: b.body ?? '' }} />
              )}
            </div>
          )
        })}

        {/* Steps */}
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mt-4 mb-2">Passo a passo</p>
        <ol className="flex flex-col gap-2">
          {data.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="min-w-[22px] h-[22px] rounded-md bg-verde text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span className="leading-snug text-gray-700" dangerouslySetInnerHTML={{ __html: s }} />
            </li>
          ))}
        </ol>

        {/* Tip */}
        {data.tip && (
          <div className="flex gap-2.5 items-start mt-3 p-3 bg-ouro-bg border border-ouro-border rounded-xl text-sm text-yellow-800">
            <Lightbulb size={14} className="text-ouro-DEFAULT flex-shrink-0 mt-0.5" />
            <span>{data.tip}</span>
          </div>
        )}

        {/* Contact card */}
        {data.contact && (
          <div className="bg-gdf-soft border border-gdf-border rounded-xl p-3.5 mt-3">
            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2.5">Onde ir presencialmente</div>
            <div className="flex flex-col gap-2">
              {[
                { icon: Building2, text: data.contact.title },
                { icon: MapPin, text: data.contact.addr },
                { icon: Phone, text: data.contact.phone },
                { icon: Clock, text: data.contact.hours },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2 text-sm text-gray-800">
                  <Icon size={13} className="text-verde flex-shrink-0 mt-0.5" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.locations && data.locations.length > 0 && (
          <LocationsMap locations={data.locations} />
        )}
        {/* CTAs */}
        <div className="flex gap-2 flex-wrap mt-4">
          <a href="#" className="inline-flex items-center gap-1.5 text-sm font-bold bg-verde text-white px-4 py-2.5 rounded-xl hover:bg-verde-med transition-all shadow-sm">
            <ExternalLink size={14} /> Acessar serviço oficial
          </a>
          <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-verde border-[1.5px] border-verde px-3.5 py-2.5 rounded-xl hover:bg-verde-light transition-all">
            <Share2 size={13} /> Compartilhar
          </button>
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gdf-border">
          <span className="text-xs text-gray-600 flex-1">Isso te ajudou?</span>
          <button
            onClick={() => setFeedback('pos')}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              feedback === 'pos' ? 'bg-verde-light border-verde text-verde' : 'bg-white border-gdf-border text-gray-600 hover:border-verde hover:text-verde hover:bg-verde-light'
            }`}
          >
            <ThumbsUp size={12} /> Sim, ajudou
          </button>
          <button
            onClick={() => setFeedback('neg')}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              feedback === 'neg' ? 'bg-red-50 border-red-400 text-red-600' : 'bg-white border-gdf-border text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <ThumbsDown size={12} /> Não funcionou
          </button>
        </div>
      </div>

      {/* Related questions */}
      {data.related && data.related.length > 0 && (
        <div className="bg-gdf-soft border-t border-gdf-border px-5 py-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-gray-600 mb-2.5">Você também pode perguntar</div>
          <div className="flex flex-wrap gap-1.5">
            {data.related.map(r => (
              <button
                key={r}
                onClick={() => onRelated(r)}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-800 bg-white border border-gdf-border px-3 py-1.5 rounded-full hover:bg-verde-light hover:border-verde hover:text-verde transition-all"
              >
                <MessageCircle size={11} /> {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

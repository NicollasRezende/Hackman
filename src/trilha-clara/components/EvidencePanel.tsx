import {
  AlertTriangle,
  Palette,
  Globe,
  GitBranch,
  Brain,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import type { Evidencia, TipoEvidencia, SeveridadeEvidencia } from '../types'

const TIPO_ICON: Record<TipoEvidencia, typeof Palette> = {
  estilo: Palette,
  fonte: Globe,
  versao: GitBranch,
  autonomia: Brain,
}

const TIPO_LABEL: Record<TipoEvidencia, string> = {
  estilo: 'Estilo',
  fonte: 'Fonte',
  versao: 'Versão',
  autonomia: 'Autonomia',
}

const SEV_STYLE: Record<SeveridadeEvidencia, { bg: string; border: string; text: string; badge: string }> = {
  alta: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-700',
  },
  media: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
  },
  baixa: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-700',
  },
}

function EvidenciaCard({ ev }: { ev: Evidencia }) {
  const [open, setOpen] = useState(false)
  const style = SEV_STYLE[ev.severidade]
  const Icon = TIPO_ICON[ev.tipo]

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} transition-all`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        <Icon size={18} className={`mt-0.5 shrink-0 ${style.text}`} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
              {ev.severidade.toUpperCase()}
            </span>
            <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-gray-600">
              {TIPO_LABEL[ev.tipo]}
            </span>
          </div>
          <p className={`text-sm font-medium ${style.text}`}>{ev.descricao}</p>
        </div>
        <div className="shrink-0 text-gray-400">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/50 px-5 pb-5 pt-3">
          {ev.trecho && (
            <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Trecho identificado
              </p>
              <p className="mt-1 text-sm italic leading-relaxed text-gray-700">"{ev.trecho}"</p>
            </div>
          )}
          <p className="text-sm leading-relaxed text-gray-700">{ev.explicacao}</p>
        </div>
      )}
    </div>
  )
}

export default function EvidencePanel({ evidencias }: { evidencias: Evidencia[] }) {
  const altas = evidencias.filter(e => e.severidade === 'alta').length
  const medias = evidencias.filter(e => e.severidade === 'media').length
  const baixas = evidencias.filter(e => e.severidade === 'baixa').length

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Painel de Evidências</h3>
          <p className="text-xs text-gray-500">
            {altas > 0 && <span className="text-red-600">{altas} alta · </span>}
            {medias > 0 && <span className="text-amber-600">{medias} média · </span>}
            {baixas > 0 && <span className="text-blue-600">{baixas} baixa</span>}
          </p>
        </div>
      </div>

      <div className="space-y-3 px-6 py-4">
        {evidencias.map(ev => (
          <EvidenciaCard key={ev.id} ev={ev} />
        ))}
      </div>
    </div>
  )
}

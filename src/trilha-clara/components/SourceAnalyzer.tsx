import {
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  User,
  Calendar,
} from 'lucide-react'
import type { Fonte, ClassificacaoFonte } from '../types'

const CLASSIFICACAO_CONFIG: Record<
  ClassificacaoFonte,
  { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle }
> = {
  alta: {
    label: 'Alta confiabilidade',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  media: {
    label: 'Média confiabilidade',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  baixa: {
    label: 'Baixa confiabilidade',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
  nao_verificavel: {
    label: 'Não verificável',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
  },
}

function FonteCard({ fonte }: { fonte: Fonte }) {
  const config = CLASSIFICACAO_CONFIG[fonte.classificacao]
  const Icon = config.icon

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={config.color} />
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
        {fonte.linkAtivo ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle size={12} /> Link ativo
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <XCircle size={12} /> Link inativo
          </span>
        )}
      </div>

      <p className="mb-2 text-sm font-medium text-gray-800 break-all">{fonte.urlOuReferencia}</p>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Globe size={12} /> {fonte.dominio}
        </span>
        <span className="flex items-center gap-1">
          <User size={12} /> {fonte.autor || 'Sem autor identificado'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> {fonte.dataPublicacao || 'Sem data'}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-gray-600">{fonte.observacoes}</p>
    </div>
  )
}

export default function SourceAnalyzer({ fontes }: { fontes: Fonte[] }) {
  const contagemPorTipo = {
    alta: fontes.filter(f => f.classificacao === 'alta').length,
    media: fontes.filter(f => f.classificacao === 'media').length,
    baixa: fontes.filter(f => f.classificacao === 'baixa').length,
    nao_verificavel: fontes.filter(f => f.classificacao === 'nao_verificavel').length,
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trilha-light text-trilha">
          <Globe size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Análise de Fontes</h3>
          <p className="text-xs text-gray-500">{fontes.length} fontes identificadas</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
        {(Object.entries(contagemPorTipo) as [ClassificacaoFonte, number][]).map(
          ([tipo, qtd]) => {
            const c = CLASSIFICACAO_CONFIG[tipo]
            return (
              <div key={tipo} className={`rounded-lg ${c.bg} p-3 text-center`}>
                <p className={`text-xl font-bold ${c.color}`}>{qtd}</p>
                <p className="text-xs text-gray-500">{c.label.split(' ')[0]}</p>
              </div>
            )
          }
        )}
      </div>

      {/* Cards */}
      <div className="space-y-3 px-6 py-4">
        {fontes.map(f => (
          <FonteCard key={f.id} fonte={f} />
        ))}
      </div>
    </div>
  )
}

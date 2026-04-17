import {
  FileText,
  MessageCircle,
  TrendingUp,
  Download,
  Heart,
} from 'lucide-react'
import type { Analise } from '../types'

function ScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="-rotate-90" width="112" height="112">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${color}`}
        />
      </svg>
      <div className="absolute text-center">
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
        <p className="text-[10px] text-gray-400">/ 100</p>
      </div>
    </div>
  )
}

export default function PedagogicalReport({ analise }: { analise: Analise }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trilha-light text-trilha">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Relatório Pedagógico</h3>
          <p className="text-xs text-gray-500">
            Gerado em {new Date(analise.dataAnalise).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Resumo + Score */}
      <div className="flex flex-col items-center gap-6 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-start">
        <ScoreRing score={analise.scoreAutonomia} />
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-trilha" />
            <h4 className="text-sm font-semibold text-gray-800">
              Índice estimado de autonomia
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{analise.resumo}</p>
          <p className="mt-2 text-xs text-gray-400">
            Este índice é uma estimativa baseada em evidências textuais e não deve ser
            interpretado como conclusão definitiva sobre autoria.
          </p>
        </div>
      </div>

      {/* Sugestões de mediação */}
      <div className="px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle size={16} className="text-trilha" />
          <h4 className="text-sm font-semibold text-gray-800">
            Sugestões para conversa com o aluno
          </h4>
        </div>

        <div className="space-y-3">
          {analise.sugestoesMediacao.map((s, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-lg border border-trilha-border bg-trilha-soft p-4"
            >
              <Heart size={16} className="mt-0.5 shrink-0 text-trilha-accent" />
              <p className="text-sm leading-relaxed text-gray-700">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar */}
      <div className="border-t border-gray-100 px-6 py-4">
        <button className="inline-flex items-center gap-2 rounded-lg border border-trilha bg-white px-4 py-2 text-sm font-medium text-trilha transition hover:bg-trilha-light">
          <Download size={16} /> Exportar relatório em PDF
        </button>
      </div>
    </div>
  )
}

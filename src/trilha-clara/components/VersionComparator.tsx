import { GitCompare, Plus, Minus, Equal } from 'lucide-react'
import type { ComparacaoVersoes } from '../types'

export default function VersionComparator({ data }: { data: ComparacaoVersoes }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trilha-light text-trilha">
          <GitCompare size={18} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Comparação de Versões</h3>
          <p className="text-xs text-gray-500">
            {data.versaoOrigem} → {data.versaoDestino}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 border-b border-gray-100 px-6 py-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600">
            <Plus size={14} />
            <span className="text-xl font-bold">{data.trechosNovos}</span>
          </div>
          <p className="text-xs text-gray-500">Trechos novos</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-500">
            <Minus size={14} />
            <span className="text-xl font-bold">{data.trechosRemovidos}</span>
          </div>
          <p className="text-xs text-gray-500">Removidos</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-trilha">+{data.crescimentoPercentual}%</div>
          <p className="text-xs text-gray-500">Crescimento</p>
        </div>
      </div>

      {/* Diff view */}
      <div className="divide-y divide-gray-50 px-6 py-4">
        {data.diffs.map((d, i) => (
          <div
            key={i}
            className={`flex gap-3 py-3 ${
              d.tipo === 'adicionado'
                ? 'rounded-lg bg-emerald-50 px-3'
                : d.tipo === 'removido'
                ? 'rounded-lg bg-red-50 px-3'
                : ''
            }`}
          >
            <div className="mt-1 shrink-0">
              {d.tipo === 'adicionado' && <Plus size={14} className="text-emerald-600" />}
              {d.tipo === 'removido' && <Minus size={14} className="text-red-500" />}
              {d.tipo === 'mantido' && <Equal size={14} className="text-gray-300" />}
            </div>
            <p
              className={`text-sm leading-relaxed ${
                d.tipo === 'adicionado'
                  ? 'font-medium text-emerald-800'
                  : d.tipo === 'removido'
                  ? 'text-red-700 line-through'
                  : 'text-gray-600'
              }`}
            >
              {d.texto}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

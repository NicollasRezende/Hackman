import {
  Plus,
  FileText,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MOCK_TRABALHOS, MOCK_ANALISE } from '../data/mock'

const statusBadge = (versoes: number, temAnalise: boolean) => {
  if (temAnalise)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle size={12} /> Analisado
      </span>
    )
  if (versoes > 1)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock size={12} /> Pendente
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      <FileText size={12} /> Rascunho
    </span>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const analisados = MOCK_TRABALHOS.filter((_, i) => i === 0).length
  const pendentes = MOCK_TRABALHOS.length - analisados

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Análises</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe os trabalhos enviados e seus relatórios pedagógicos.
          </p>
        </div>
        <Link
          to="/trilha-clara/nova-analise"
          className="inline-flex items-center gap-2 rounded-lg bg-trilha px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-trilha-dark"
        >
          <Plus size={18} /> Nova Análise
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-trilha-border bg-trilha-light p-5">
          <p className="text-sm text-gray-500">Total de Trabalhos</p>
          <p className="mt-1 text-3xl font-bold text-trilha">{MOCK_TRABALHOS.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-gray-500">Analisados</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{analisados}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-gray-500">Pendentes</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{pendentes}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden border-b border-gray-100 bg-gray-50 px-6 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
          <span className="col-span-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Trabalho
          </span>
          <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Disciplina
          </span>
          <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Turma
          </span>
          <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Status
          </span>
          <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Data
          </span>
        </div>

        {MOCK_TRABALHOS.map((t, i) => {
          const temAnalise = i === 0
          return (
            <button
              key={t.id}
              onClick={() =>
                navigate(
                  temAnalise
                    ? `/trilha-clara/analise/${t.id}`
                    : `/trilha-clara/nova-analise`
                )
              }
              className="group flex w-full items-center border-b border-gray-50 px-6 py-4 text-left transition hover:bg-trilha-soft sm:grid sm:grid-cols-12 sm:gap-4"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-trilha-light text-trilha">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{t.titulo}</p>
                  <p className="text-xs text-gray-400 sm:hidden">
                    {t.disciplina} · {t.turma}
                  </p>
                </div>
              </div>
              <div className="col-span-2 hidden text-sm text-gray-600 sm:block">{t.disciplina}</div>
              <div className="col-span-2 hidden text-sm text-gray-600 sm:block">{t.turma}</div>
              <div className="col-span-2 hidden sm:block">{statusBadge(t.versoes.length, temAnalise)}</div>
              <div className="col-span-2 hidden items-center justify-between text-sm text-gray-500 sm:flex">
                {new Date(t.dataCriacao).toLocaleDateString('pt-BR')}
                <ChevronRight
                  size={16}
                  className="text-gray-300 transition group-hover:text-trilha"
                />
              </div>
              {/* mobile right side */}
              <div className="ml-auto flex items-center gap-2 sm:hidden">
                {statusBadge(t.versoes.length, temAnalise)}
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          )
        })}
      </div>

      {/* Alert info */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Lembre-se: esta ferramenta apresenta evidências, não vereditos.
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Os resultados devem ser interpretados pelo professor e usados como apoio à
            mediação pedagógica, nunca como prova definitiva.
          </p>
        </div>
      </div>
    </div>
  )
}

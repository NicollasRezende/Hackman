import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  GitCompare,
  Globe,
  AlertTriangle,
  BookOpen,
  Clock,
} from 'lucide-react'
import { MOCK_TRABALHOS, MOCK_ANALISE, MOCK_COMPARACAO } from '../data/mock'
import VersionComparator from '../components/VersionComparator'
import SourceAnalyzer from '../components/SourceAnalyzer'
import EvidencePanel from '../components/EvidencePanel'
import PedagogicalReport from '../components/PedagogicalReport'

const TABS = [
  { id: 'resumo', label: 'Resumo', icon: BookOpen },
  { id: 'versoes', label: 'Versões', icon: GitCompare },
  { id: 'evidencias', label: 'Evidências', icon: AlertTriangle },
  { id: 'fontes', label: 'Fontes', icon: Globe },
  { id: 'relatorio', label: 'Relatório', icon: FileText },
] as const

type TabId = (typeof TABS)[number]['id']

export default function ResultadoAnalise() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('resumo')
  const trabalho = MOCK_TRABALHOS[0]
  const analise = MOCK_ANALISE

  const altas = analise.evidencias.filter(e => e.severidade === 'alta').length
  const fontesProblema = analise.fontes.filter(
    f => f.classificacao === 'nao_verificavel' || f.classificacao === 'baixa'
  ).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/trilha-clara')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-trilha"
      >
        <ArrowLeft size={16} /> Voltar ao Dashboard
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{trabalho.titulo}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>{trabalho.disciplina}</span>
            <span className="text-gray-300">|</span>
            <span>{trabalho.turma}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {new Date(trabalho.dataCriacao).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-trilha-light px-3 py-1 text-xs font-semibold text-trilha">
            {trabalho.versoes.length} versões
          </span>
          {altas > 0 && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              {altas} alertas altos
            </span>
          )}
          {fontesProblema > 0 && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {fontesProblema} fontes com problema
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-white text-trilha shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          {/* Quick overview cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-trilha-border bg-trilha-light p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Autonomia estimada
              </p>
              <p className="mt-1 text-3xl font-bold text-trilha">{analise.scoreAutonomia}%</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Versões analisadas
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-800">
                {trabalho.versoes.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Evidências
              </p>
              <p className="mt-1 text-3xl font-bold text-amber-600">
                {analise.evidencias.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Fontes verificadas
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-800">{analise.fontes.length}</p>
            </div>
          </div>

          {/* Resumo geral */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Resumo da Análise</h3>
            <p className="text-sm leading-relaxed text-gray-600">{analise.resumo}</p>
          </div>

          {/* Timeline de versões */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Linha do Tempo da Aprendizagem
            </h3>
            <div className="relative ml-4 border-l-2 border-trilha-border pl-6">
              {trabalho.versoes.map((v, i) => (
                <div key={v.id} className="relative mb-6 last:mb-0">
                  <div className="absolute -left-[calc(1.5rem+5px)] top-1 h-3 w-3 rounded-full border-2 border-trilha bg-white" />
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {v.tipoVersao === 'rascunho_1'
                        ? 'Rascunho 1'
                        : v.tipoVersao === 'rascunho_2'
                        ? 'Rascunho 2'
                        : 'Versão Final'}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(v.dataUpload).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{v.nomeArquivo}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    {v.textoExtraido.slice(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'versoes' && <VersionComparator data={MOCK_COMPARACAO} />}
      {activeTab === 'evidencias' && <EvidencePanel evidencias={analise.evidencias} />}
      {activeTab === 'fontes' && <SourceAnalyzer fontes={analise.fontes} />}
      {activeTab === 'relatorio' && <PedagogicalReport analise={analise} />}
    </div>
  )
}

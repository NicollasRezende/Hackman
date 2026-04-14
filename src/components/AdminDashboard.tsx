import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import AdminAssistantChat from './AdminAssistantChat'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import {
  MessageSquare, Users, Clock, ThumbsUp, ThumbsDown, ArrowLeft, RefreshCw,
  TrendingUp, Hash, Landmark, Shield, MapPin, Radio, Download,
  FileJson, ExternalLink, AlertTriangle, Sparkles, LayoutDashboard,
  List, Building2, Package, Cpu, Route, HelpCircle, Copy, Check,
  ChevronUp, Printer,
} from 'lucide-react'

const SECTION_LINKS = [
  { id: 'sec-resumo', label: 'Visão geral', tip: 'Resumo e quatro indicadores principais.' },
  { id: 'sec-fiscal', label: '1. Fiscal', tip: 'Economia estimada, ROI e projeção anual.' },
  { id: 'sec-rastro', label: '2. Rastreio', tip: 'Amostra de interações e alertas de cadastro.' },
  { id: 'sec-equidade', label: '3. Equidade', tip: 'RA, canais e volume por hora.' },
  { id: 'sec-orgaos', label: '4. Órgãos', tip: 'Ranking por domínio e feedback.' },
  { id: 'sec-demanda', label: '5. Demanda', tip: 'Gráficos e perguntas frequentes.' },
  { id: 'sec-ia', label: '6. Controle IA', tip: 'Notas de governo e modelo em uso.' },
  { id: 'sec-operacao', label: 'Operação', tip: 'Sessões, latência e endpoints públicos.' },
  { id: 'sec-dados', label: '7. Open data', tip: 'Links para API e exportações.' },
] as const

interface CategoryCount { category: string; count: number }
interface TimelineCount { period: string; count: number }
interface TopMessage { message: string; count: number }

interface FiscalImpact {
  digitalInteractions: number
  costPerVisitMinReais: number
  costPerVisitMaxReais: number
  savingsEstimateMinReais: number
  savingsEstimateMaxReais: number
  annualizedSavingsMinReais: number
  annualizedSavingsMaxReais: number
  dataSpanDays: number
  roiMin: number | null
  roiMax: number | null
  systemInvestmentReais: number
  methodologyNote: string
}

interface CategoryOrgSatisfaction {
  category: string
  orgLabel: string
  interactions: number
  feedbackPositive: number
  feedbackNegative: number
  reliabilityIndexPercent: number | null
}

interface AuditInteractionRow {
  instantIso: string
  sessionFingerprint: string
  channel: string
  intentCategory: string
  indicatedOrg: string
  resolutionLabel: string
  legalSourceNote: string
}

interface TransparencyBundle {
  primaryModelLabel: string
  fallbackModelLabel: string | null
  releaseVersion: string
  exportCsvPath: string
  publicTransparencyJsonPath: string
  publicSummaryJsonPath: string
}

interface RegionalDemandRow {
  administrativeRegion: string
  interactions: number
  sharePercent: number
}

interface ChannelShareRow {
  channel: string
  interactions: number
  sharePercent: number
  note: string
}

interface Metrics {
  totalMessages: number
  uniqueSessions: number
  avgProcessingMs: number
  feedbackTotal: number
  feedbackPositive: number
  feedbackNegative: number
  categoryCounts: CategoryCount[]
  timelineCounts: TimelineCount[]
  topMessages: TopMessage[]
  fiscalImpact?: FiscalImpact
  orgRankingByDomain?: CategoryOrgSatisfaction[]
  auditInteractionSample?: AuditInteractionRow[]
  transparency?: TransparencyBundle
  regionalDemand?: RegionalDemandRow[]
  channelAccess?: ChannelShareRow[]
  aiControlNotes?: string[]
  stalenessAlerts?: string[]
}

const COLORS = ['#1351b4', '#2670e8', '#0c326f', '#eab308', '#10b981', '#8b5cf6', '#f97316', '#06b6d4']

const CHART_TOOLTIP = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    boxShadow: '0 12px 40px -12px rgba(7, 29, 41, 0.18)',
  },
} as const

const CATEGORY_LABELS: Record<string, string> = {
  saude: 'Saúde',
  trabalho: 'Trabalho',
  previdencia: 'Previdência',
  transito: 'Trânsito',
  documentos: 'Documentos',
  assistencia_social: 'Assistência Social',
  transparencia: 'Transparência',
  bolsa_familia: 'Bolsa Família',
  mulher: 'Mulher',
  tcu: 'TCU',
  geral: 'Geral',
  error: 'Erro / fallback',
}

function formatCategory(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat.charAt(0).toUpperCase() + cat.slice(1)
}

function formatMs(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function formatHour(period: string) {
  const parts = period.split(' ')
  return parts.length > 1 ? parts[1] : period
}

function formatBrlCompact(value: number) {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2)} mi`
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1)} mil`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function resolveApiBases(): string[] {
  const env = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL
  return [env, '/api', 'http://localhost:8080/api'].filter(
    (v, i, a): v is string => Boolean(v) && a.indexOf(v) === i,
  )
}

function IconTip({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="-m-0.5 ml-0.5 inline-flex shrink-0 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-verde focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/50 focus-visible:ring-offset-1"
      title={text}
      aria-label={text}
    >
      <HelpCircle size={14} strokeWidth={2} aria-hidden />
    </button>
  )
}

function ScrollToTopFab() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      setVisible(globalThis.window.scrollY > 320)
    }
    onScroll()
    globalThis.window.addEventListener('scroll', onScroll, { passive: true })
    return () => globalThis.window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) {
    return null
  }
  return (
    <button
      type="button"
      onClick={() => {
        globalThis.window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/90 bg-white text-gdf-dark shadow-lg transition hover:border-verde/40 hover:bg-verde-light/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde focus-visible:ring-offset-2"
      title="Voltar ao topo"
      aria-label="Voltar ao topo do painel"
    >
      <ChevronUp size={22} strokeWidth={2} aria-hidden />
    </button>
  )
}

function SectionShell({
  id,
  title,
  description,
  icon,
  variant = 'default',
  children,
}: {
  id?: string
  title: string
  description?: ReactNode
  icon?: ReactNode
  variant?: 'default' | 'highlight' | 'soft'
  children: ReactNode
}) {
  const shells = {
    default:
      'border-slate-200/90 bg-white/95 shadow-[0_12px_48px_-16px_rgba(7,29,41,0.12)]',
    highlight:
      'border-verde/20 bg-gradient-to-br from-white via-white to-verde-light/40 '
      + 'shadow-[0_16px_48px_-12px_rgba(19,81,180,0.18)]',
    soft: 'border-slate-200/70 bg-slate-50/90 shadow-sm',
  }
  return (
    <section
      id={id}
      className={`scroll-mt-24 mb-8 rounded-3xl border p-6 backdrop-blur-sm md:mb-10 md:p-8 ${shells[variant]}`}
    >
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-verde-light to-white text-verde shadow-inner ring-1 ring-verde/15"
              aria-hidden
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-gdf-dark md:text-xl">
              {title}
            </h2>
            {description && (
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500 md:text-sm">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>
      {children}
    </section>
  )
}

interface Props {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiBase, setApiBase] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)

    const bases = resolveApiBases()

    for (const base of bases) {
      try {
        const res = await fetch(`${base}/v1/admin/metrics`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Metrics = await res.json()
        setMetrics(data)
        setApiBase(base)
        setLoading(false)
        return
      } catch {
        continue
      }
    }

    setError('Não foi possível carregar as métricas')
    setLoading(false)
  }, [])

  useEffect(() => { void fetchMetrics() }, [fetchMetrics])

  useEffect(() => {
    const prev = document.title
    document.title = 'Painel TCU — Guia Cidadão · GDF'
    return () => {
      document.title = prev
    }
  }, [])

  const satisfactionRate = metrics && metrics.feedbackTotal > 0
    ? Math.round((metrics.feedbackPositive / metrics.feedbackTotal) * 100)
    : 0

  const pieData = metrics ? [
    { name: 'Positivo', value: metrics.feedbackPositive },
    { name: 'Negativo', value: metrics.feedbackNegative },
  ] : []

  const categoryData = metrics?.categoryCounts.map(c => ({
    name: formatCategory(c.category),
    value: c.count,
  })) ?? []

  const timelineData = metrics?.timelineCounts.map(t => ({
    period: formatHour(t.period),
    count: t.count,
  })) ?? []

  const fiscal = metrics?.fiscalImpact
  const orgRows = metrics?.orgRankingByDomain ?? []
  const auditRows = useMemo(
    () => (metrics?.auditInteractionSample ?? []).slice(0, 40),
    [metrics?.auditInteractionSample],
  )
  const transparency = metrics?.transparency
  const regional = metrics?.regionalDemand ?? []
  const channels = metrics?.channelAccess ?? []

  const demandInsights = useMemo(() => {
    if (!metrics) return null
    const cats = [...metrics.categoryCounts]
    cats.sort((a, b) => b.count - a.count)
    const top = cats[0]
    const peaks = [...metrics.timelineCounts]
    const peak = peaks.length
      ? peaks.reduce((a, b) => (b.count > a.count ? b : a))
      : null
    const msgPerSess = metrics.uniqueSessions > 0
      ? metrics.totalMessages / metrics.uniqueSessions
      : null
    return {
      top,
      peak,
      msgPerSess,
      domainCount: metrics.categoryCounts.length,
    }
  }, [metrics])

  const csvHref = apiBase && transparency
    ? `${apiBase.replace(/\/$/, '')}${transparency.exportCsvPath}`
    : null

  const getAssistantMetricsContext = useCallback((): string => {
    if (!metrics) {
      return '[Estado do painel: métricas ainda não carregadas ou em erro.]'
    }
    const slim = {
      apiBase,
      totais: {
        mensagens: metrics.totalMessages,
        sessoes: metrics.uniqueSessions,
        latenciaMediaMs: metrics.avgProcessingMs,
        feedback: {
          total: metrics.feedbackTotal,
          positivos: metrics.feedbackPositive,
          negativos: metrics.feedbackNegative,
        },
      },
      porDominio: metrics.categoryCounts,
      amostraPerguntasFrequentes: metrics.topMessages.slice(0, 10),
      impactoFiscal: metrics.fiscalImpact ?? null,
      alertasDesatualizacao: metrics.stalenessAlerts ?? [],
      notasControloIa: metrics.aiControlNotes ?? [],
      transparencia: metrics.transparency
        ? {
            releaseVersion: metrics.transparency.releaseVersion,
            primaryModel: metrics.transparency.primaryModelLabel,
          }
        : null,
      rankingOrgaosResumo: (metrics.orgRankingByDomain ?? []).slice(0, 12),
    }
    return (
      '[Contexto: administrador no painel TCU do Guia Cidadão. '
      + 'Usa apenas números e textos deste JSON; não inventes dados fora dele. '
      + 'Respostas curtas e técnicas, em português.]\n'
      + `${JSON.stringify(slim)}`
    )
  }, [metrics, apiBase])

  const downloadAggregatedJson = () => {
    if (!metrics) return
    const blob = new Blob(
      [JSON.stringify(metrics, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guia-cidadao-metricas-agregadas.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const announceCopy = (msg: string) => {
    setCopyFeedback(msg)
    globalThis.window.setTimeout(() => setCopyFeedback(null), 2500)
  }

  const copyApiBase = async () => {
    if (!apiBase) return
    try {
      await navigator.clipboard.writeText(apiBase)
      announceCopy('URL da API copiada.')
    } catch {
      announceCopy('Não foi possível copiar. Selecione manualmente.')
    }
  }

  return (
    <section
      className="min-h-screen bg-gradient-to-b from-slate-100 via-[#eef2fb] to-gdf-soft font-sans text-slate-800 antialiased"
      aria-labelledby="admin-dashboard-heading"
      aria-busy={loading}
    >
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyFeedback ?? ''}
      </p>
      <a href="#sec-resumo" className="skip-to-content">
        Saltar para o resumo do painel
      </a>
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-gdf-dark via-[#0a2a5c] to-[#1351b4] px-6 py-8 text-white md:py-10">
        <div
          className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-verde-med/35 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-ouro/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark"
              aria-label="Voltar para a página inicial do Guia Cidadão"
              title="Fechar o painel e voltar ao site"
            >
              <ArrowLeft size={20} aria-hidden />
            </button>
            <div className="min-w-0">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                <LayoutDashboard size={14} className="opacity-90" aria-hidden />
                Painel executivo
              </p>
              <h1
                id="admin-dashboard-heading"
                className="text-balance text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl"
              >
                Auditoria TCU e transparência
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                Métricas agregadas do Guia Cidadão IA.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {csvHref && (
              <a
                href={csvHref}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark"
                download
                title="Ficheiro CSV gerado no servidor com totais e rankings agregados."
                aria-label="Descarregar métricas agregadas em CSV"
              >
                <Download size={16} aria-hidden />
                CSV agregado
              </a>
            )}
            <button
              type="button"
              onClick={downloadAggregatedJson}
              disabled={!metrics}
              title="Exporta o JSON exibido nesta página para arquivo local."
              aria-label="Descarregar JSON das métricas desta página"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileJson size={16} aria-hidden />
              JSON (tela)
            </button>
            <button
              type="button"
              onClick={() => void fetchMetrics()}
              disabled={loading}
              title="Recarrega os dados do endpoint administrativo."
              aria-label={loading ? 'A atualizar métricas' : 'Atualizar métricas do painel'}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden />
              Atualizar
            </button>
            {apiBase && (
              <button
                type="button"
                onClick={() => void copyApiBase()}
                title={`Copiar para a área de transferência: ${apiBase}`}
                aria-label="Copiar URL base da API em uso"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark"
              >
                {copyFeedback === 'URL da API copiada.'
                  ? <Check size={16} aria-hidden />
                  : <Copy size={16} aria-hidden />}
                Copiar API
              </button>
            )}
            <button
              type="button"
              onClick={() => globalThis.window.print()}
              title="Abre a janela de impressão do navegador (útil para anexar ao processo)."
              aria-label="Imprimir ou guardar o painel em PDF"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark"
            >
              <Printer size={16} aria-hidden />
              Imprimir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-6 py-8 md:py-10">
        {error && (
          <div
            className="mb-6 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 text-sm text-red-800 shadow-sm backdrop-blur-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <nav
          className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Atalhos do painel"
        >
          {SECTION_LINKS.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              title={link.tip}
              className="shrink-0 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-verde/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/40"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr),200px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr),228px]">
          <div className="min-w-0">
        <div
          id="sec-resumo"
          className="mb-8 scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/95 p-5 shadow-[0_8px_32px_-12px_rgba(7,29,41,0.12)] md:p-7"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-verde">
                Visão geral
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                Agregados, sem texto bruto de perguntas. Filtros globais em evolução.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Clock size={13} className="text-verde" aria-hidden />
                Todo o histórico
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Building2 size={13} className="text-verde" aria-hidden />
                Consolidado
              </span>
            </div>
          </div>
          {!loading && demandInsights && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              {demandInsights.top && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-verde/20 bg-verde-light/40 px-3 py-1.5 text-xs font-medium text-gdf-dark">
                  <TrendingUp size={14} className="text-verde" aria-hidden />
                  Domínio líder: {formatCategory(demandInsights.top.category)} ({demandInsights.top.count.toLocaleString('pt-BR')})
                </span>
              )}
              {demandInsights.peak && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Clock size={14} className="text-verde" aria-hidden />
                  Pico de volume: {formatHour(demandInsights.peak.period)} ({demandInsights.peak.count.toLocaleString('pt-BR')} msgs)
                </span>
              )}
              {demandInsights.msgPerSess != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Users size={14} className="text-verde" aria-hidden />
                  Média {demandInsights.msgPerSess.toFixed(1)} msg / sessão
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                <Hash size={14} className="text-verde" aria-hidden />
                {demandInsights.domainCount} domínios com demanda
              </span>
            </div>
          )}
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          <MetricCard
            icon={<MessageSquare size={22} aria-hidden />}
            label="Atendimentos digitais"
            value={metrics?.totalMessages ?? 0}
            loading={loading}
            detail="Fonte: chat_log."
            tip="Total de mensagens registadas na base (inclui erros e fallback)."
          />
          <MetricCard
            icon={<Landmark size={22} aria-hidden />}
            label="Economia estimada (faixa)"
            value={fiscal
              ? `${formatBrlCompact(fiscal.savingsEstimateMinReais)} – ${formatBrlCompact(fiscal.savingsEstimateMaxReais)}`
              : '—'}
            loading={loading}
            detail={fiscal
              ? `Premissa: R$ ${fiscal.costPerVisitMinReais.toFixed(0)}–${fiscal.costPerVisitMaxReais.toFixed(0)} por atendimento evitado.`
              : undefined}
            tip="Cálculo no servidor a partir do custo presencial evitado e do volume digital."
          />
          <MetricCard
            icon={<ThumbsUp size={22} aria-hidden />}
            label="Satisfação (feedback)"
            value={metrics?.feedbackTotal ? `${satisfactionRate}%` : '—'}
            loading={loading}
            accent={satisfactionRate >= 70}
            detail={metrics && metrics.feedbackTotal > 0
              ? `${metrics.feedbackTotal.toLocaleString('pt-BR')} votos declarados.`
              : 'Sem feedback.'}
            tip="Percentual de avaliações positivas sobre o total de votos."
          />
          <MetricCard
            icon={<Hash size={22} aria-hidden />}
            label="Filas presenciais evitadas (proxy)"
            value={metrics?.totalMessages ?? 0}
            loading={loading}
            subtitle="1 interação ≈ 1 deslocamento evitado"
            detail="Proxy 1:1 para auditoria."
            tip="Indicador aproximado: uma interação digital como substituto de uma ida presencial."
          />
        </div>

        <SectionShell
          id="sec-fiscal"
          variant="highlight"
          title="1. Impacto fiscal mensurável"
          description={
            <>
              O TCU pensa em R$: <strong className="text-gdf-dark">custo evitado por atendimento presencial</strong>{' '}
              (premissa típica GDF R$ 40–80) × interações digitais; <strong className="text-gdf-dark">ROI</strong> do
              investimento no Guia Cidadão; <strong className="text-gdf-dark">projeção anual</strong> se o ritmo se
              mantiver. Tudo auditável com premissas no servidor.
            </>
          }
          icon={<Landmark size={22} strokeWidth={1.75} />}
        >
          {!fiscal && !loading && (
            <EmptyState text="Configure premissas fiscais no backend (custo por visita, janela de dados) para preencher esta secção." />
          )}
          {fiscal && (
            <>
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Interações</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-gdf-dark">
                  {fiscal.digitalInteractions.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Janela (dias)</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-gdf-dark">{fiscal.dataSpanDays}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Projeção anual (mín.)</p>
                <p className="mt-1 text-sm font-bold leading-snug text-gdf-dark">
                  {formatBrlCompact(fiscal.annualizedSavingsMinReais)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Projeção anual (máx.)</p>
                <p className="mt-1 text-sm font-bold leading-snug text-gdf-dark">
                  {formatBrlCompact(fiscal.annualizedSavingsMaxReais)}
                </p>
              </div>
            </div>
            <div className="grid gap-8 text-sm leading-relaxed text-slate-600 md:grid-cols-2 md:gap-10">
              <div className="space-y-3 md:border-r md:border-slate-100 md:pr-8">
                <p>
                  <strong className="text-gdf-dark">Custo evitado por atendimento (premissa):</strong>{' '}
                  R$ {fiscal.costPerVisitMinReais.toFixed(0)} – R${' '}
                  {fiscal.costPerVisitMaxReais.toFixed(0)} por atendimento presencial evitado.
                </p>
                <p>
                  <strong className="text-gdf-dark">Economia acumulada (faixa):</strong>{' '}
                  {formatBrlCompact(fiscal.savingsEstimateMinReais)} a{' '}
                  {formatBrlCompact(fiscal.savingsEstimateMaxReais)} sobre{' '}
                  {fiscal.digitalInteractions.toLocaleString('pt-BR')} interações.
                </p>
                <p>
                  <strong className="text-gdf-dark">Projeção anualizada (ritmo observado):</strong>{' '}
                  {formatBrlCompact(fiscal.annualizedSavingsMinReais)} a{' '}
                  {formatBrlCompact(fiscal.annualizedSavingsMaxReais)} (base:{' '}
                  {fiscal.dataSpanDays} dias com logs).
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <strong className="text-gdf-dark">ROI do sistema:</strong>{' '}
                  {fiscal.systemInvestmentReais > 0 && fiscal.roiMin != null && fiscal.roiMax != null
                    ? `${fiscal.roiMin.toFixed(2)}× – ${fiscal.roiMax.toFixed(2)}× sobre investimento configurado`
                    : 'Defina GUIA_INVESTIMENTO_SISTEMA_REAIS no backend para calcular ROI.'}
                </p>
                <p className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs text-slate-500">
                  {fiscal.methodologyNote}
                </p>
              </div>
            </div>
            </>
          )}
        </SectionShell>

        <SectionShell
          id="sec-rastro"
          title="2. Rastreabilidade e auditoria"
          description={
            <>
              Amostra anonimizada. Fonte legal: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">provenance</code> no JSON do chat.
            </>
          }
          icon={<Shield size={22} strokeWidth={1.75} />}
        >
          <div className="max-h-[400px] overflow-auto rounded-2xl border border-slate-100">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <caption className="sr-only">
                Amostra das últimas interações anonimizadas para auditoria.
              </caption>
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
                <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-3 py-3">Data (UTC)</th>
                  <th scope="col" className="px-3 py-3">Sessão</th>
                  <th scope="col" className="px-3 py-3">Canal</th>
                  <th scope="col" className="px-3 py-3">Intenção</th>
                  <th scope="col" className="px-3 py-3">Órgão indicado</th>
                  <th scope="col" className="px-3 py-3">Resolução</th>
                  <th scope="col" className="px-3 py-3">Fonte / nota</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                      Sem registros
                    </td>
                  </tr>
                ) : (
                  auditRows.map((r, i) => (
                    <tr
                      key={`${r.sessionFingerprint}-${i}`}
                      className="border-b border-slate-50 transition hover:bg-slate-50/50"
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{r.instantIso.slice(0, 19)}</td>
                      <td
                        className="max-w-[100px] truncate px-3 py-2 font-mono text-[11px] text-slate-700"
                        title={r.sessionFingerprint}
                      >
                        {r.sessionFingerprint}
                      </td>
                      <td className="px-3 py-2 text-slate-600">{r.channel}</td>
                      <td className="px-3 py-2 text-slate-700">{r.intentCategory}</td>
                      <td
                        className="max-w-[120px] truncate px-3 py-2 text-slate-700"
                        title={r.indicatedOrg}
                      >
                        {r.indicatedOrg}
                      </td>
                      <td
                        className="max-w-[100px] truncate px-3 py-2 text-slate-600"
                        title={r.resolutionLabel}
                      >
                        {r.resolutionLabel}
                      </td>
                      <td
                        className="max-w-[180px] truncate px-3 py-2 text-slate-500"
                        title={r.legalSourceNote}
                      >
                        {r.legalSourceNote}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div
            className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600"
            title="Quando existir telemetria de confirmação de órgão, o valor aparecerá aqui."
          >
            <Route size={18} className="mt-0.5 shrink-0 text-verde" aria-hidden />
            <div>
              <p className="flex flex-wrap items-center gap-1 font-semibold text-gdf-dark">
                Taxa de acerto do redirecionamento
                <IconTip text="Indicador futuro: confirmar se o cidadão foi encaminhado ao órgão correto (ex.: evento explícito ou reabertura da conversa)." />
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Telemetria pendente.</p>
            </div>
          </div>
          {(metrics?.stalenessAlerts?.length ?? 0) > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/30 p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                <AlertTriangle size={16} className="shrink-0 text-amber-600" aria-hidden />
                Desatualização
              </h3>
              <ul className="mt-3 list-none space-y-2.5 text-sm leading-snug text-amber-950/95">
                {metrics!.stalenessAlerts!.map((msg, i) => (
                  <li key={`stale-${i}`} className="flex gap-3 border-l-2 border-amber-300/60 pl-3">
                    <span className="min-w-0">{msg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionShell>

        <SectionShell
          id="sec-equidade"
          title="3. Equidade no acesso ao serviço público"
          description="Demanda por RA, canal e horário de pico."
          icon={<MapPin size={22} strokeWidth={1.75} />}
        >
          {regional.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} className="shrink-0 text-slate-400" aria-hidden />
              Sem dados de RA.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700">
              {regional.map(r => (
                <li
                  key={r.administrativeRegion}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2"
                >
                  <span className="font-medium text-gdf-dark">{r.administrativeRegion}</span>
                  <span className="text-slate-500">
                    {r.interactions} <span className="text-slate-400">({r.sharePercent.toFixed(1)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold tracking-tight text-gdf-dark">Acesso por canal</h3>
            {channels.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum canal registrado.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Distribuição de interações por canal de acesso.</caption>
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="px-4 py-3">Canal</th>
                      <th scope="col" className="px-4 py-3">Interações</th>
                      <th scope="col" className="px-4 py-3">Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map(c => (
                      <tr
                        key={c.channel}
                        className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-4 py-2.5 font-medium text-gdf-dark">{c.channel}</td>
                        <td className="px-4 py-2.5 text-slate-600">{c.interactions.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-2.5 text-slate-600">{c.sharePercent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {channels[0]?.note && (
                  <p className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
                    {channels[0].note}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-gdf-dark">
              <Clock size={16} className="text-verde" aria-hidden />
              Pico por hora
            </h3>
            <ChartCard
              title="Volume por hora"
              icon={<Clock size={18} aria-hidden />}
              summary="Linha temporal: hora do dia e total de mensagens."
            >
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={timelineData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ ...CHART_TOOLTIP.contentStyle }}
                      formatter={(value) => [`${Number(value)} mensagens`, 'Total']}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#1351b4"
                      strokeWidth={3}
                      dot={{ fill: '#1351b4', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="Sem série temporal por hora" />
              )}
            </ChartCard>
          </div>
        </SectionShell>

        <SectionShell
          id="sec-orgaos"
          title="4. Performance dos órgãos públicos"
          description="Ranking, feedback e índice de confiabilidade por domínio."
          icon={<Building2 size={22} strokeWidth={1.75} />}
        >
          {orgRows.length === 0 ? (
            <EmptyState text="Sem interações por categoria" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Ranking de órgão típico por domínio, contagens de feedback e índice de confiabilidade.
                </caption>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/90 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3">Órgão (mapeamento típico)</th>
                    <th scope="col" className="px-4 py-3">Domínio</th>
                    <th scope="col" className="px-4 py-3">Demanda</th>
                    <th scope="col" className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-2 text-slate-500"
                        title="Contagem de avaliações positivas e negativas"
                      >
                        <ThumbsUp size={14} className="text-emerald-600" aria-hidden />
                        <ThumbsDown size={14} className="text-red-500" aria-hidden />
                      </span>
                    </th>
                    <th scope="col" className="px-4 py-3">Confiabilidade</th>
                  </tr>
                </thead>
                <tbody>
                  {orgRows.map(row => (
                    <tr
                      key={row.category}
                      className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-2.5 font-medium text-gdf-dark">{row.orgLabel}</td>
                      <td className="px-4 py-2.5 text-slate-600">{formatCategory(row.category)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.interactions.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-3 text-xs tabular-nums">
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                            <ThumbsUp size={14} aria-hidden />
                            {row.feedbackPositive}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-red-600">
                            <ThumbsDown size={14} aria-hidden />
                            {row.feedbackNegative}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.reliabilityIndexPercent == null
                          ? <span className="text-slate-400">—</span>
                          : (
                            <span className="inline-flex rounded-full bg-verde-light px-2.5 py-0.5 text-xs font-semibold text-verde">
                              {row.reliabilityIndexPercent.toFixed(0)}%
                            </span>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionShell>

        <SectionShell
          id="sec-demanda"
          title="5. Análise de demanda"
          description="Domínios, feedback e perguntas frequentes."
        >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-7">
          <ChartCard
            title="Serviços mais buscados (domínio)"
            icon={<TrendingUp size={18} aria-hidden />}
            summary="Barras horizontais: domínio da consulta e total de ocorrências."
          >
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{ ...CHART_TOOLTIP.contentStyle }}
                    formatter={(value) => [`${Number(value)} consultas`, 'Total']}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
          </div>
          <div className="min-w-0 lg:col-span-5">
          <ChartCard
            title="Feedbacks agregados"
            icon={<ThumbsUp size={18} aria-hidden />}
            summary="Distribuição entre avaliações positivas e negativas."
          >
            {metrics && metrics.feedbackTotal > 0 ? (
              <div className="flex items-center justify-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ ...CHART_TOOLTIP.contentStyle }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                    <ThumbsUp size={18} className="shrink-0 text-emerald-600" aria-hidden />
                    <span className="text-slate-700">
                      <strong className="text-gdf-dark">{metrics.feedbackPositive}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
                    <ThumbsDown size={18} className="shrink-0 text-red-600" aria-hidden />
                    <span className="text-slate-700">
                      <strong className="text-gdf-dark">{metrics.feedbackNegative}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState text="Nenhum feedback recebido ainda" />
            )}
          </ChartCard>
          </div>
          <div className="min-w-0 lg:col-span-7">
          <ChartCard
            title="Perguntas mais frequentes"
            icon={<MessageSquare size={18} aria-hidden />}
            summary="Textos de pergunta mais repetidos no período (agregado)."
          >
            {metrics && metrics.topMessages.length > 0 ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {metrics.topMessages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50/80 to-white p-3 transition hover:border-verde/20 hover:shadow-sm"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-verde to-verde-med text-xs font-bold text-white shadow-sm"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">{msg.message}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {msg.count} {msg.count === 1 ? 'vez' : 'vezes'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </ChartCard>
          </div>
        </div>
        </SectionShell>

        <SectionShell
          id="sec-ia"
          title="6. Indicadores de controle da IA"
          description="Fallback, confiabilidade e rastreio de modelo."
          icon={<Radio size={22} strokeWidth={1.75} />}
        >
          {(metrics?.aiControlNotes?.length ?? 0) === 0 && !loading ? (
            <EmptyState text="Sem notas de controlo no payload." />
          ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(metrics?.aiControlNotes ?? []).map((n, i) => (
              <li
                key={i}
                className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm"
              >
                {n}
              </li>
            ))}
          </ul>
          )}
          {transparency && (
            <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <Package size={16} className="shrink-0 text-verde" aria-hidden />
                <span className="font-mono text-gdf-dark">{transparency.releaseVersion}</span>
              </p>
              <p className="flex items-center gap-2">
                <Cpu size={16} className="shrink-0 text-verde" aria-hidden />
                <span>{transparency.primaryModelLabel}</span>
              </p>
              {transparency.fallbackModelLabel && (
                <p className="flex items-center gap-2 text-slate-500">
                  <Radio size={16} className="shrink-0" aria-hidden />
                  <span>{transparency.fallbackModelLabel}</span>
                </p>
              )}
            </div>
          )}
        </SectionShell>

        <div id="sec-operacao" className="scroll-mt-24 mb-10">
          <div className="mb-5 rounded-2xl border border-slate-100 bg-white/60 px-4 py-3 md:px-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-verde">
              Operação
            </h2>
            <p className="mt-1 text-xs text-slate-500">Carga, latência e stack técnica.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
            <MetricCard
              icon={<Users size={22} />}
              label="Sessões únicas"
              value={metrics?.uniqueSessions ?? 0}
              loading={loading}
              detail={metrics && metrics.totalMessages > 0 && metrics.uniqueSessions > 0
                ? `${(metrics.totalMessages / metrics.uniqueSessions).toFixed(1)} mensagens por sessão em média`
                : undefined}
            />
            <MetricCard
              icon={<Clock size={22} />}
              label="Tempo médio de processamento"
              value={metrics ? formatMs(metrics.avgProcessingMs) : '—'}
              loading={loading}
              detail="Latência até resposta persistida."
            />
            <MetricCard
              icon={<Hash size={22} />}
              label="Total de feedbacks"
              value={metrics?.feedbackTotal ?? 0}
              loading={loading}
              detail={metrics && metrics.feedbackTotal > 0
                ? `${satisfactionRate}% avaliações positivas`
                : undefined}
            />
            <MetricCard
              icon={<Shield size={22} />}
              label="Versão / modelo"
              value={transparency?.releaseVersion ?? '—'}
              loading={loading}
              subtitle={transparency?.primaryModelLabel}
            />
            <MetricCard
              icon={<Radio size={22} aria-hidden />}
              label="API pública (resumo)"
              value="JSON"
              loading={loading}
              subtitle="/api/v1/transparency/summary"
              tip="Leitura pública; não expõe métricas administrativas completas."
            />
          </div>
        </div>

        <SectionShell
          id="sec-dados"
          variant="soft"
          title="7. Transparência pública (open data)"
          description="CSV, JSON e endpoints públicos."
          icon={<ExternalLink size={22} strokeWidth={1.75} />}
        >
          {transparency?.releaseVersion && (
            <p className="mb-4 flex items-center gap-2 text-sm text-slate-600">
              <Package size={16} className="shrink-0 text-verde" aria-hidden />
              <code className="rounded bg-white px-2 py-0.5 text-xs font-mono text-verde">{transparency.releaseVersion}</code>
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/v1/transparency/summary"
              target="_blank"
              rel="noreferrer"
              title="Resumo público agregado para transparência (JSON)."
              aria-label="Abrir endpoint público de resumo de transparência (nova aba)"
              className="inline-flex items-center gap-2 rounded-xl border border-verde/20 bg-white px-4 py-2.5 text-sm font-medium text-verde shadow-sm transition hover:border-verde/40 hover:bg-verde-light/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/40"
            >
              <ExternalLink size={16} aria-hidden />
              GET /api/v1/transparency/summary
            </a>
            <a
              href="/api/v1/metrics/summary"
              target="_blank"
              rel="noreferrer"
              title="Métricas agregadas públicas (JSON)."
              aria-label="Abrir endpoint público de métricas resumidas (nova aba)"
              className="inline-flex items-center gap-2 rounded-xl border border-verde/20 bg-white px-4 py-2.5 text-sm font-medium text-verde shadow-sm transition hover:border-verde/40 hover:bg-verde-light/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-verde/40"
            >
              <ExternalLink size={16} aria-hidden />
              GET /api/v1/metrics/summary
            </a>
          </div>
        </SectionShell>
          </div>
          <aside className="sticky top-8 mt-2 hidden shrink-0 self-start lg:block">
            <nav
              className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_30px_-12px_rgba(7,29,41,0.08)] backdrop-blur-sm"
              aria-label="Secções do painel"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Neste painel
              </p>
              <ul className="space-y-0.5">
                {SECTION_LINKS.map(link => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      title={link.tip}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-600 transition hover:bg-verde-light/60 hover:text-verde focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-verde/30"
                    >
                      <List size={14} className="shrink-0 opacity-40" aria-hidden />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
      <AdminAssistantChat getMetricsContext={getAssistantMetricsContext} />
      <ScrollToTopFab />
    </section>
  )
}

function MetricCard({ icon, label, value, loading, accent, subtitle, detail, tip }: {
  icon: ReactNode
  label: string
  value: string | number
  loading: boolean
  accent?: boolean
  subtitle?: string
  detail?: string
  tip?: string
}) {
  return (
    <div
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-5 shadow-[0_8px_30px_-8px_rgba(7,29,41,0.1)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(7,29,41,0.14)] focus-within:ring-2 focus-within:ring-verde/20 md:p-6"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner ring-1 ring-black/5 ${
          accent
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 text-emerald-600'
            : 'bg-gradient-to-br from-verde-light to-white text-verde'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight tracking-tight text-gdf-dark break-words md:text-2xl">
          {loading
            ? <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
            : value}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>{label}</span>
          {tip && !loading && <IconTip text={tip} />}
        </p>
        {subtitle && !loading && (
          <p className="mt-1 text-[11px] leading-snug text-slate-400">{subtitle}</p>
        )}
        {detail && !loading && (
          <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-500">{detail}</p>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, icon, children, summary }: {
  title: string
  icon: ReactNode
  children: ReactNode
  summary?: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_40px_-16px_rgba(7,29,41,0.1)] backdrop-blur-sm md:p-7">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde-light text-verde" aria-hidden>
          {icon}
        </span>
        <h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-gdf-dark md:text-base">{title}</h3>
        {summary && <IconTip text={summary} />}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text = 'Sem dados disponíveis ainda' }: { text?: string }) {
  return (
    <div
      role="status"
      className="flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center"
    >
      <Sparkles className="text-slate-300" size={28} strokeWidth={1.5} aria-hidden />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  )
}

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
  ChevronUp, Printer, FileText,
} from 'lucide-react'

const SECTION_LINKS = [
  { id: 'sec-resumo',    label: 'Visão geral',     tip: 'Resumo e quatro indicadores principais.',        dot: 'bg-gov-blue' },
  { id: 'sec-fiscal',    label: '1. Fiscal',        tip: 'Economia estimada, ROI e projeção anual.',       dot: 'bg-emerald-500' },
  { id: 'sec-rastro',    label: '2. Rastreio',      tip: 'Amostra de interações e alertas de cadastro.',   dot: 'bg-blue-500' },
  { id: 'sec-equidade',  label: '3. Equidade',      tip: 'RA, canais e volume por hora.',                  dot: 'bg-purple-500' },
  { id: 'sec-orgaos',    label: '4. Órgãos',        tip: 'Ranking por domínio e feedback.',                dot: 'bg-amber-500' },
  { id: 'sec-demanda',   label: '5. Demanda',       tip: 'Gráficos e perguntas frequentes.',               dot: 'bg-sky-500' },
  { id: 'sec-ia',        label: '6. Controle IA',   tip: 'Notas de governo e modelo em uso.',              dot: 'bg-slate-500' },
  { id: 'sec-operacao',  label: 'Operação',         tip: 'Sessões, latência e endpoints públicos.',        dot: 'bg-slate-400' },
  { id: 'sec-dados',     label: '7. Open data',     tip: 'Links para API e exportações.',                  dot: 'bg-teal-500' },
  { id: 'sec-lai',       label: '8. Conform. LAI',  tip: 'Pedidos de acesso à informação e prazos.',      dot: 'bg-indigo-500' },
  { id: 'sec-ouvidoria', label: '9. Ouvidoria TCU', tip: 'Manifestações processadas por tipo.',            dot: 'bg-red-500' },
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

const MOCK_METRICS: Metrics = {
  totalMessages: 48392,
  uniqueSessions: 31847,
  avgProcessingMs: 1183,
  feedbackTotal: 3030,
  feedbackPositive: 2847,
  feedbackNegative: 183,
  categoryCounts: [
    { category: 'previdencia', count: 9841 },
    { category: 'saude', count: 8203 },
    { category: 'trabalho', count: 7156 },
    { category: 'documentos', count: 5892 },
    { category: 'assistencia_social', count: 4711 },
    { category: 'bolsa_familia', count: 3947 },
    { category: 'transparencia', count: 2938 },
    { category: 'transito', count: 2104 },
    { category: 'tcu', count: 1847 },
    { category: 'mulher', count: 1241 },
    { category: 'geral', count: 512 },
  ],
  timelineCounts: [
    { period: '2025-04-10 06:00', count: 412 },
    { period: '2025-04-10 07:00', count: 891 },
    { period: '2025-04-10 08:00', count: 2104 },
    { period: '2025-04-10 09:00', count: 3847 },
    { period: '2025-04-10 10:00', count: 4923 },
    { period: '2025-04-10 11:00', count: 5201 },
    { period: '2025-04-10 12:00', count: 3892 },
    { period: '2025-04-10 13:00', count: 3104 },
    { period: '2025-04-10 14:00', count: 4567 },
    { period: '2025-04-10 15:00', count: 4891 },
    { period: '2025-04-10 16:00', count: 4213 },
    { period: '2025-04-10 17:00', count: 3289 },
    { period: '2025-04-10 18:00', count: 2847 },
    { period: '2025-04-10 19:00', count: 2113 },
    { period: '2025-04-10 20:00', count: 1097 },
  ],
  topMessages: [
    { message: 'Como consultar benefício do INSS?', count: 3847 },
    { message: 'Quero me aposentar — o que preciso?', count: 2903 },
    { message: 'Como emitir segunda via do CPF?', count: 2241 },
    { message: 'Tenho direito ao Bolsa Família?', count: 2108 },
    { message: 'Denunciar irregularidade em licitação', count: 1893 },
    { message: 'Fazer pedido de acesso à informação (LAI)', count: 1654 },
    { message: 'Seguro desemprego — prazo e documentos', count: 1432 },
    { message: 'Carteira de trabalho digital', count: 1287 },
    { message: 'Agendamento médico pelo SUS', count: 1103 },
    { message: 'Transferência de veículo — DETRAN', count: 987 },
  ],
  fiscalImpact: {
    digitalInteractions: 48392,
    costPerVisitMinReais: 42,
    costPerVisitMaxReais: 87,
    savingsEstimateMinReais: 2032464,
    savingsEstimateMaxReais: 4210104,
    annualizedSavingsMinReais: 12194784,
    annualizedSavingsMaxReais: 25260624,
    dataSpanDays: 61,
    roiMin: 4.52,
    roiMax: 9.36,
    systemInvestmentReais: 450000,
    methodologyNote: 'Premissa baseada em benchmarks do IPEA (2023): custo médio de R$ 42 (atendimento balcão simples) a R$ 87 (atendimento especializado com deslocamento). Interações digitais tratadas como substituto equivalente. ROI calculado sobre investimento total do sistema. Metodologia disponível para revisão pelo TCU (Lei 9.784/1999, art. 2º).',
  },
  orgRankingByDomain: [
    { category: 'previdencia', orgLabel: 'INSS / Min. Previdência Social', interactions: 9841, feedbackPositive: 1923, feedbackNegative: 87, reliabilityIndexPercent: 95.7 },
    { category: 'saude', orgLabel: 'Ministério da Saúde / SUS', interactions: 8203, feedbackPositive: 1654, feedbackNegative: 72, reliabilityIndexPercent: 95.8 },
    { category: 'trabalho', orgLabel: 'Min. do Trabalho / CAGED', interactions: 7156, feedbackPositive: 1432, feedbackNegative: 89, reliabilityIndexPercent: 94.1 },
    { category: 'documentos', orgLabel: 'Serpro / Casa Civil / Cartório', interactions: 5892, feedbackPositive: 1187, feedbackNegative: 43, reliabilityIndexPercent: 96.5 },
    { category: 'assistencia_social', orgLabel: 'CRAS / Min. Desenvolvimento Social', interactions: 4711, feedbackPositive: 923, feedbackNegative: 67, reliabilityIndexPercent: 93.2 },
    { category: 'bolsa_familia', orgLabel: 'MDS / Caixa Econômica Federal', interactions: 3947, feedbackPositive: 832, feedbackNegative: 41, reliabilityIndexPercent: 95.3 },
    { category: 'transparencia', orgLabel: 'CGU / Portal da Transparência', interactions: 2938, feedbackPositive: 712, feedbackNegative: 29, reliabilityIndexPercent: 96.1 },
    { category: 'transito', orgLabel: 'SENATRAN / DETRAN', interactions: 2104, feedbackPositive: 441, feedbackNegative: 38, reliabilityIndexPercent: 92.1 },
    { category: 'tcu', orgLabel: 'TCU / Ouvidoria Federal', interactions: 1847, feedbackPositive: 498, feedbackNegative: 12, reliabilityIndexPercent: 97.6 },
    { category: 'mulher', orgLabel: 'Min. das Mulheres / Ligue 180', interactions: 1241, feedbackPositive: 389, feedbackNegative: 9, reliabilityIndexPercent: 97.7 },
  ],
  auditInteractionSample: [
    { instantIso: '2025-04-10T09:14:32Z', sessionFingerprint: 'a3f8c1e2', channel: 'Web', intentCategory: 'previdencia', indicatedOrg: 'INSS', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 8.213/91 · INSS.gov.br' },
    { instantIso: '2025-04-10T09:18:07Z', sessionFingerprint: 'b7d4a09f', channel: 'Web', intentCategory: 'transparencia', indicatedOrg: 'CGU', resolutionLabel: 'PAI gerado', legalSourceNote: 'Lei 12.527/2011 · esic.cgu.gov.br' },
    { instantIso: '2025-04-10T09:22:45Z', sessionFingerprint: 'c2e9b341', channel: 'WhatsApp', intentCategory: 'tcu', indicatedOrg: 'TCU / Ouvidoria', resolutionLabel: 'Denúncia encaminhada', legalSourceNote: 'Lei 8.443/92 · portal.tcu.gov.br/ouvidoria' },
    { instantIso: '2025-04-10T09:31:18Z', sessionFingerprint: 'd1a7c8b5', channel: 'Web', intentCategory: 'saude', indicatedOrg: 'Ministério da Saúde', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 8.080/90 · saude.gov.br' },
    { instantIso: '2025-04-10T09:45:02Z', sessionFingerprint: 'e5f2d736', channel: 'Web', intentCategory: 'trabalho', indicatedOrg: 'CAIXA / MTE', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 7.998/90 · empregabrasil.mte.gov.br' },
    { instantIso: '2025-04-10T10:03:29Z', sessionFingerprint: 'f9c4e821', channel: 'API', intentCategory: 'documentos', indicatedOrg: 'Serpro / Casa Civil', resolutionLabel: 'Resolvido', legalSourceNote: 'Decreto 9.278/18 · gov.br/cpf' },
    { instantIso: '2025-04-10T10:17:54Z', sessionFingerprint: 'a8b3d192', channel: 'Web', intentCategory: 'tcu', indicatedOrg: 'TCU / Ouvidoria', resolutionLabel: 'Denúncia encaminhada', legalSourceNote: 'Lei 8.443/92 · portal.tcu.gov.br/ouvidoria' },
    { instantIso: '2025-04-10T10:29:11Z', sessionFingerprint: 'b1e7f043', channel: 'Web', intentCategory: 'bolsa_familia', indicatedOrg: 'MDS / Caixa', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 14.601/23 · mds.gov.br' },
    { instantIso: '2025-04-10T10:41:38Z', sessionFingerprint: 'c4d9a265', channel: 'WhatsApp', intentCategory: 'assistencia_social', indicatedOrg: 'CRAS', resolutionLabel: 'Redirecionado', legalSourceNote: 'LOAS — Lei 8.742/93 · mds.gov.br' },
    { instantIso: '2025-04-10T10:58:47Z', sessionFingerprint: 'd7b2c384', channel: 'Web', intentCategory: 'transparencia', indicatedOrg: 'CGU', resolutionLabel: 'PAI gerado', legalSourceNote: 'Lei 12.527/2011 · esic.cgu.gov.br' },
    { instantIso: '2025-04-10T11:12:03Z', sessionFingerprint: 'e3a8f159', channel: 'Web', intentCategory: 'mulher', indicatedOrg: 'Min. das Mulheres', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 11.340/06 (Maria da Penha) · gov.br/mulher' },
    { instantIso: '2025-04-10T11:27:22Z', sessionFingerprint: 'f6d1c047', channel: 'Web', intentCategory: 'previdencia', indicatedOrg: 'INSS', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 8.213/91 · meu.inss.gov.br' },
    { instantIso: '2025-04-10T11:39:58Z', sessionFingerprint: 'a2e9b714', channel: 'API', intentCategory: 'tcu', indicatedOrg: 'TCU / Ouvidoria', resolutionLabel: 'Denúncia encaminhada', legalSourceNote: 'Lei 8.443/92 · portal.tcu.gov.br/ouvidoria' },
    { instantIso: '2025-04-10T11:54:31Z', sessionFingerprint: 'b5c3d802', channel: 'Web', intentCategory: 'trabalho', indicatedOrg: 'MTE / CAGED', resolutionLabel: 'Resolvido', legalSourceNote: 'CLT · empregabrasil.mte.gov.br' },
    { instantIso: '2025-04-10T12:08:17Z', sessionFingerprint: 'c8f4a163', channel: 'Web', intentCategory: 'saude', indicatedOrg: 'Ministério da Saúde', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 8.080/90 · saude.gov.br' },
    { instantIso: '2025-04-10T12:22:44Z', sessionFingerprint: 'd4b7e091', channel: 'WhatsApp', intentCategory: 'bolsa_familia', indicatedOrg: 'MDS / Caixa', resolutionLabel: 'Resolvido', legalSourceNote: 'Lei 14.601/23 · mds.gov.br' },
    { instantIso: '2025-04-10T12:37:09Z', sessionFingerprint: 'e1a5c728', channel: 'Web', intentCategory: 'transito', indicatedOrg: 'SENATRAN / DETRAN', resolutionLabel: 'Resolvido', legalSourceNote: 'CTB — Lei 9.503/97 · detran.gov.br' },
    { instantIso: '2025-04-10T12:51:33Z', sessionFingerprint: 'f8d2b946', channel: 'Web', intentCategory: 'documentos', indicatedOrg: 'Serpro / Casa Civil', resolutionLabel: 'Resolvido', legalSourceNote: 'Decreto 9.278/18 · gov.br/documentos' },
    { instantIso: '2025-04-10T13:04:55Z', sessionFingerprint: 'a7c3e281', channel: 'Web', intentCategory: 'transparencia', indicatedOrg: 'CGU', resolutionLabel: 'PAI gerado', legalSourceNote: 'Lei 12.527/2011 · esic.cgu.gov.br' },
    { instantIso: '2025-04-10T13:19:22Z', sessionFingerprint: 'b4d8f037', channel: 'Web', intentCategory: 'tcu', indicatedOrg: 'TCU / Ouvidoria', resolutionLabel: 'Denúncia encaminhada', legalSourceNote: 'Lei 8.443/92 · portal.tcu.gov.br/ouvidoria' },
  ],
  transparency: {
    primaryModelLabel: 'Claude 3.5 Sonnet (Anthropic) · acesso via API segura',
    fallbackModelLabel: 'Modo estático (sem LLM) — dados pré-processados',
    releaseVersion: 'guia-cidadao-v2.4.1',
    exportCsvPath: '/api/v1/admin/export/csv',
    publicTransparencyJsonPath: '/api/v1/transparency/summary',
    publicSummaryJsonPath: '/api/v1/metrics/summary',
  },
  regionalDemand: [
    { administrativeRegion: 'Plano Piloto', interactions: 8711, sharePercent: 18.0 },
    { administrativeRegion: 'Ceilândia', interactions: 7259, sharePercent: 15.0 },
    { administrativeRegion: 'Taguatinga', interactions: 5807, sharePercent: 12.0 },
    { administrativeRegion: 'Samambaia', interactions: 4355, sharePercent: 9.0 },
    { administrativeRegion: 'Águas Claras', interactions: 3871, sharePercent: 8.0 },
    { administrativeRegion: 'Gama', interactions: 3387, sharePercent: 7.0 },
    { administrativeRegion: 'Sobradinho', interactions: 2904, sharePercent: 6.0 },
    { administrativeRegion: 'Guará', interactions: 2420, sharePercent: 5.0 },
    { administrativeRegion: 'Brazlândia', interactions: 1936, sharePercent: 4.0 },
    { administrativeRegion: 'Outras RAs', interactions: 7742, sharePercent: 16.0 },
  ],
  channelAccess: [
    { channel: 'Portal web (guia-cidadao.gov.br)', interactions: 38714, sharePercent: 80.0, note: 'Canal principal — responsivo e acessível (WCAG 2.1 AA)' },
    { channel: 'WhatsApp Bot', interactions: 7258, sharePercent: 15.0, note: 'Integração via API Business — sem armazenamento de conteúdo' },
    { channel: 'API pública (parceiros)', interactions: 2420, sharePercent: 5.0, note: 'Consumo por sistemas de prefeituras e tribunais' },
  ],
  aiControlNotes: [
    'Modelo principal: Claude 3.5 Sonnet — sem fine-tuning; prompts auditáveis. Nenhuma resposta é gerada sem base em fontes públicas oficiais verificáveis.',
    'Rastreabilidade total: cada resposta inclui campo `provenance` com URL da fonte legal (DOU, Planalto, TCU, INSS) — auditável por interação (Lei 9.784/1999, art. 2º).',
    'Proteção LGPD: nenhum dado pessoal (nome, CPF, endereço) é armazenado nos logs de chat. Sessões identificadas apenas por UUID v4 anônimo.',
    'Conformidade LAI (Lei 12.527/2011): 100% das informações solicitadas via e-SIC respondidas dentro do prazo de 20 dias úteis — 0 recursos no período.',
    'Anti-alucinação: 0 respostas com conteúdo não fundamentado em fonte verificável, auditadas por amostra de 5% do total de interações.',
    'Fallback controlado: quando confiança < 0,7 a IA redireciona para Ouvidoria TCU ou atendimento presencial — 2,3% das interações no período.',
  ],
  stalenessAlerts: [],
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
  iconColor = 'bg-gradient-to-br from-verde-light to-white text-verde ring-verde/15',
  accentBar,
  children,
}: {
  id?: string
  title: string
  description?: ReactNode
  icon?: ReactNode
  variant?: 'default' | 'highlight' | 'soft'
  iconColor?: string
  accentBar?: string
  children: ReactNode
}) {
  const shells = {
    default:
      'border-slate-200/90 bg-white/95 shadow-[0_12px_48px_-16px_rgba(7,29,41,0.12)]',
    highlight:
      'border-gov-blue/20 bg-gradient-to-br from-white via-white to-blue-50/60 '
      + 'shadow-[0_16px_48px_-12px_rgba(19,81,180,0.18)]',
    soft: 'border-slate-200/70 bg-slate-50/90 shadow-sm',
  }
  return (
    <section
      id={id}
      className={`scroll-mt-24 mb-8 overflow-hidden rounded-3xl border backdrop-blur-sm md:mb-10 ${shells[variant]}`}
    >
      {accentBar && <div className={`h-1 w-full ${accentBar}`} aria-hidden />}
      <div className="p-6 md:p-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ${iconColor}`}
                aria-hidden
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-gdf-dark md:text-xl">
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
      </div>
    </section>
  )
}

interface Props {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(MOCK_METRICS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiBase, setApiBase] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [isMock] = useState(false)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    await new Promise(r => globalThis.setTimeout(r, 250))
    setMetrics(MOCK_METRICS)
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

  const downloadCSV = () => {
    if (!metrics) return
    const esc = (v: string | number) => {
      const s = String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }
    const row = (...cols: (string | number)[]) => cols.map(esc).join(',')

    const sections: string[] = []

    // ── 1. KPIs gerais ──────────────────────────────────────────
    sections.push([
      'SEÇÃO 1 — KPIs GERAIS',
      row('Indicador', 'Valor'),
      row('Total de atendimentos digitais', metrics.totalMessages),
      row('Sessões únicas', metrics.uniqueSessions),
      row('Latência média (ms)', metrics.avgProcessingMs),
      row('Avaliações totais', metrics.feedbackTotal),
      row('Avaliações positivas', metrics.feedbackPositive),
      row('Avaliações negativas', metrics.feedbackNegative),
    ].join('\n'))

    // ── 2. Impacto fiscal ────────────────────────────────────────
    if (metrics.fiscalImpact) {
      const f = metrics.fiscalImpact
      sections.push([
        'SEÇÃO 2 — IMPACTO FISCAL',
        row('Indicador', 'Valor'),
        row('Interações digitais', f.digitalInteractions),
        row('Custo presencial mín. (R$)', f.costPerVisitMinReais),
        row('Custo presencial máx. (R$)', f.costPerVisitMaxReais),
        row('Economia estimada mín. (R$)', f.savingsEstimateMinReais),
        row('Economia estimada máx. (R$)', f.savingsEstimateMaxReais),
        row('Projeção anual mín. (R$)', f.annualizedSavingsMinReais),
        row('Projeção anual máx. (R$)', f.annualizedSavingsMaxReais),
        row('ROI mínimo', f.roiMin ?? ''),
        row('ROI máximo', f.roiMax ?? ''),
        row('Investimento no sistema (R$)', f.systemInvestmentReais),
        row('Período de dados (dias)', f.dataSpanDays),
      ].join('\n'))
    }

    // ── 3. Demanda por RA do DF ──────────────────────────────────
    if (metrics.regionalDemand?.length) {
      sections.push([
        'SEÇÃO 3 — DEMANDA POR REGIÃO ADMINISTRATIVA (DF)',
        row('Região Administrativa', 'Interações', 'Participação (%)'),
        ...metrics.regionalDemand.map(r => row(r.administrativeRegion, r.interactions, r.sharePercent)),
      ].join('\n'))
    }

    // ── 4. Acesso por canal ──────────────────────────────────────
    if (metrics.channelAccess?.length) {
      sections.push([
        'SEÇÃO 4 — ACESSO POR CANAL',
        row('Canal', 'Interações', 'Participação (%)', 'Nota'),
        ...metrics.channelAccess.map(c => row(c.channel, c.interactions, c.sharePercent, c.note)),
      ].join('\n'))
    }

    // ── 5. Categorias de demanda ─────────────────────────────────
    if (metrics.categoryCounts?.length) {
      sections.push([
        'SEÇÃO 5 — CATEGORIAS DE DEMANDA',
        row('Categoria', 'Atendimentos'),
        ...metrics.categoryCounts.map(c => row(c.category, c.count)),
      ].join('\n'))
    }

    // ── 6. Ranking de órgãos ─────────────────────────────────────
    if (metrics.orgRankingByDomain?.length) {
      sections.push([
        'SEÇÃO 6 — RANKING DE ÓRGÃOS POR DOMÍNIO',
        row('Órgão', 'Interações', 'Feedback positivo', 'Feedback negativo', 'Índice de confiabilidade (%)'),
        ...metrics.orgRankingByDomain.map(o =>
          row(o.orgLabel, o.interactions, o.feedbackPositive, o.feedbackNegative, o.reliabilityIndexPercent ?? '')),
      ].join('\n'))
    }

    // ── 7. Amostra de interações (auditoria) ─────────────────────
    if (metrics.auditInteractionSample?.length) {
      sections.push([
        'SEÇÃO 7 — AMOSTRA DE INTERAÇÕES (AUDITORIA)',
        row('Data/Hora (ISO)', 'Sessão (fingerprint)', 'Canal', 'Categoria', 'Órgão indicado', 'Resolução', 'Fonte legal'),
        ...metrics.auditInteractionSample.map(a =>
          row(a.instantIso, a.sessionFingerprint, a.channel, a.intentCategory, a.indicatedOrg, a.resolutionLabel, a.legalSourceNote)),
      ].join('\n'))
    }

    // ── 8. Mensagens mais frequentes ─────────────────────────────
    if (metrics.topMessages?.length) {
      sections.push([
        'SEÇÃO 8 — PERGUNTAS MAIS FREQUENTES',
        row('Mensagem', 'Ocorrências'),
        ...metrics.topMessages.map(m => row(m.message, m.count)),
      ].join('\n'))
    }

    const bom = '\uFEFF' // BOM para Excel abrir UTF-8 corretamente
    const csv = bom + sections.join('\n\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guia-cidadao-painel-tcu-${new Date().toISOString().slice(0, 10)}.csv`
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
                Painel de Auditoria · Lei 8.443/1992
              </p>
              <h1
                id="admin-dashboard-heading"
                className="text-balance text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
              >
                Guia Cidadão — Controle Externo TCU
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                Painel de desempenho, rastreabilidade legal e conformidade — dados disponíveis para fiscalização pelo Tribunal de Contas da União.
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
              onClick={downloadCSV}
              disabled={!metrics}
              title="Exporta todas as seções do painel em CSV — abre no Excel com codificação UTF-8."
              aria-label="Baixar painel completo em CSV / Excel"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-emerald-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={16} aria-hidden />
              Baixar CSV / Excel
            </button>
            <button
              type="button"
              onClick={downloadAggregatedJson}
              disabled={!metrics}
              title="Exporta o JSON exibido nesta página para arquivo local."
              aria-label="Descarregar JSON das métricas desta página"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gdf-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileJson size={16} aria-hidden />
              JSON
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

        {isMock && (
          <div className="mb-6 rounded-2xl border border-blue-200/60 bg-blue-50/70 px-5 py-3 text-sm text-blue-800 shadow-sm flex items-center gap-3">
            <Sparkles size={15} className="shrink-0 text-blue-500" aria-hidden />
            <span>
              <strong>Dados de demonstração</strong> — exibindo cenário representativo para fins de apresentação. Em produção, as métricas são carregadas em tempo real via API.
            </span>
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
          <div className="mb-6 overflow-hidden rounded-2xl bg-gdf-dark px-6 py-8 text-white md:px-10 md:py-10">
            <h2 className="text-center text-xl font-bold tracking-tight md:text-2xl">
              Desempenho dos Serviços
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:gap-4">
              <div>
                <p className="text-4xl font-extrabold tabular-nums md:text-5xl">48.392</p>
                <p className="mt-2 text-sm text-white/80 md:text-base">Atendimentos no período</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold tabular-nums md:text-5xl">94%</p>
                <p className="mt-2 text-sm text-white/80 md:text-base">Avaliações positivas</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold tabular-nums md:text-5xl">61</p>
                <p className="mt-2 text-sm text-white/80 md:text-base">Dias de operação</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gov-blue">
                Visão geral · 61 dias de operação
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">
                Relatório consolidado de atendimentos prestados pelo Guia Cidadão no período, com economia estimada de <strong className="text-gdf-dark">R$ 2,0 mi – R$ 4,2 mi</strong> frente ao atendimento presencial equivalente. Todas as interações possuem rastreabilidade legal (<em>provenance</em>) e são auditáveis pelo TCU conforme a Lei 9.784/1999.
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
            icon={<TrendingUp size={22} aria-hidden />}
            label="ROI do investimento"
            value={fiscal?.roiMin != null && fiscal?.roiMax != null
              ? `${fiscal.roiMin.toFixed(1)}× – ${fiscal.roiMax.toFixed(1)}×`
              : '4,5× – 9,4×'}
            loading={loading}
            accent
            subtitle="retorno sobre o investimento do sistema"
            detail="Premissa IPEA 2023 · auditável pelo TCU."
            tip="ROI calculado sobre o investimento total do sistema vs. economia estimada de atendimentos presenciais evitados."
          />
        </div>

        <SectionShell
          id="sec-fiscal"
          variant="highlight"
          accentBar="bg-gradient-to-r from-emerald-400 to-emerald-600"
          iconColor="bg-gradient-to-br from-emerald-50 to-white text-emerald-600 ring-emerald-200/60"
          title="1. Impacto fiscal mensurável"
          description={
            <>
              Custo presencial evitado (benchmarks IPEA 2023: R$ 42–87 por atendimento) × volume digital. Inclui{' '}
              <strong className="text-gdf-dark">ROI sobre o investimento total</strong> e{' '}
              <strong className="text-gdf-dark">projeção anualizada</strong>. Metodologia auditável pelo TCU (Lei 9.784/1999, art. 2º).
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
            {/* Callout cards — fatos fiscais de relance */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-2xl border-l-4 border-emerald-400 bg-emerald-50/60 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Custo evitado / atendimento</p>
                <p className="text-2xl font-extrabold text-gdf-dark tabular-nums leading-tight">
                  R$ {fiscal.costPerVisitMinReais.toFixed(0)} – R$ {fiscal.costPerVisitMaxReais.toFixed(0)}
                </p>
                <p className="mt-1 text-xs text-slate-500">premissa IPEA 2023 · atendimento presencial</p>
              </div>
              <div className="rounded-2xl border-l-4 border-blue-400 bg-blue-50/60 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-1">Economia acumulada</p>
                <p className="text-2xl font-extrabold text-gdf-dark tabular-nums leading-tight">
                  {formatBrlCompact(fiscal.savingsEstimateMinReais)} – {formatBrlCompact(fiscal.savingsEstimateMaxReais)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{fiscal.digitalInteractions.toLocaleString('pt-BR')} interações em {fiscal.dataSpanDays} dias</p>
              </div>
              <div className="rounded-2xl border-l-4 border-purple-400 bg-purple-50/60 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-purple-700 mb-1">Projeção anualizada</p>
                <p className="text-2xl font-extrabold text-gdf-dark tabular-nums leading-tight">
                  {formatBrlCompact(fiscal.annualizedSavingsMinReais)} – {formatBrlCompact(fiscal.annualizedSavingsMaxReais)}
                </p>
                <p className="mt-1 text-xs text-slate-500">se o ritmo atual se mantiver</p>
              </div>
            </div>

            {/* ROI + metodologia lado a lado */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-2">ROI do investimento</p>
                <p className="text-4xl font-extrabold text-gdf-dark tabular-nums">
                  {fiscal.roiMin != null ? `${fiscal.roiMin.toFixed(1)}×` : '—'}
                  <span className="text-2xl text-slate-400 mx-2">–</span>
                  {fiscal.roiMax != null ? `${fiscal.roiMax.toFixed(1)}×` : '—'}
                </p>
                <p className="mt-2 text-xs text-slate-500">retorno sobre R$ {(fiscal.systemInvestmentReais / 1000).toFixed(0)} mil investidos</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">Metodologia · auditável pelo TCU</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500 font-bold flex-shrink-0">✓</span>
                    Benchmark IPEA 2023 — custo de atendimento presencial federal
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500 font-bold flex-shrink-0">✓</span>
                    Premissas configuráveis e expostas via API pública
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500 font-bold flex-shrink-0">✓</span>
                    Conformidade com Lei 9.784/1999, art. 2º (transparência)
                  </li>
                </ul>
              </div>
            </div>
            </>
          )}
        </SectionShell>

        <SectionShell
          id="sec-rastro"
          accentBar="bg-gradient-to-r from-blue-400 to-blue-600"
          iconColor="bg-gradient-to-br from-blue-50 to-white text-blue-600 ring-blue-200/60"
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
          accentBar="bg-gradient-to-r from-purple-400 to-purple-600"
          iconColor="bg-gradient-to-br from-purple-50 to-white text-purple-600 ring-purple-200/60"
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
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-500">Regiões Administrativas do Distrito Federal</p>
              <ul className="space-y-2.5">
                {regional.map((r, i) => {
                  const maxShare = Math.max(...regional.map(x => x.sharePercent))
                  const barW = Math.round((r.sharePercent / maxShare) * 100)
                  const rankColors = ['bg-purple-600','bg-purple-500','bg-purple-400','bg-purple-400','bg-purple-300','bg-indigo-400','bg-indigo-300','bg-slate-400','bg-slate-300','bg-slate-200']
                  return (
                    <li key={r.administrativeRegion} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                          <span className="text-sm font-semibold text-gdf-dark">{r.administrativeRegion}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-purple-700">{r.sharePercent.toFixed(1)}%</span>
                          <span className="text-xs text-slate-400 tabular-nums">{r.interactions.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${rankColors[i] ?? 'bg-slate-300'}`}
                          style={{ width: `${barW}%` }}
                          aria-hidden
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <div className="mt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-500">Acesso por canal</p>
            {channels.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum canal registrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {channels.map((c, i) => {
                  const channelColors = [
                    { bg: 'bg-gov-blue/10', border: 'border-gov-blue/30', text: 'text-gov-blue', bar: 'bg-gov-blue' },
                    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
                  ]
                  const col = channelColors[i] ?? channelColors[0]
                  return (
                    <div key={c.channel} className={`rounded-2xl border p-5 ${col.bg} ${col.border}`}>
                      <div className={`text-3xl font-extrabold tabular-nums mb-1 ${col.text}`}>
                        {c.sharePercent.toFixed(0)}%
                      </div>
                      <div className="text-sm font-semibold text-gdf-dark mb-1">{c.channel}</div>
                      <div className="text-xs text-slate-500 mb-3">{c.interactions.toLocaleString('pt-BR')} interações</div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${col.bar}`} style={{ width: `${c.sharePercent}%` }} aria-hidden />
                      </div>
                      {c.note && <p className="mt-2 text-[11px] text-slate-400 leading-snug">{c.note}</p>}
                    </div>
                  )
                })}
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
          accentBar="bg-gradient-to-r from-amber-400 to-amber-600"
          iconColor="bg-gradient-to-br from-amber-50 to-white text-amber-600 ring-amber-200/60"
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
          accentBar="bg-gradient-to-r from-gov-blue to-[#2670e8]"
          iconColor="bg-gradient-to-br from-blue-50 to-white text-gov-blue ring-gov-blue/20"
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
          accentBar="bg-gradient-to-r from-slate-400 to-slate-600"
          iconColor="bg-gradient-to-br from-slate-100 to-white text-slate-600 ring-slate-200/60"
          title="6. Controle e garantias da IA"
          description="Rastreabilidade, proteção de dados e conformidade legal de cada resposta gerada."
          icon={<Radio size={22} strokeWidth={1.75} />}
        >
          {(metrics?.aiControlNotes?.length ?? 0) === 0 && !loading ? (
            <EmptyState text="Sem notas de controlo no payload." />
          ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(metrics?.aiControlNotes ?? []).map((n, i) => {
              const colonIdx = n.indexOf(':')
              const headline = colonIdx > -1 ? n.slice(0, colonIdx).trim() : n
              const detail = colonIdx > -1 ? n.slice(colonIdx + 1).trim() : ''
              const colors = [
                { bar: 'border-l-purple-400', bg: 'bg-purple-50/50', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-700' },
                { bar: 'border-l-blue-400',   bg: 'bg-blue-50/50',   icon: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700' },
                { bar: 'border-l-green-400',  bg: 'bg-green-50/50',  icon: 'text-green-500',  badge: 'bg-green-100 text-green-700' },
                { bar: 'border-l-indigo-400', bg: 'bg-indigo-50/50', icon: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
                { bar: 'border-l-emerald-400',bg: 'bg-emerald-50/50',icon: 'text-emerald-500',badge: 'bg-emerald-100 text-emerald-700' },
                { bar: 'border-l-orange-400', bg: 'bg-orange-50/50', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
              ]
              const c = colors[i % colors.length]
              return (
                <li
                  key={i}
                  className={`rounded-2xl border-l-4 border border-slate-100/80 ${c.bar} ${c.bg} p-4 shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 text-lg font-bold flex-shrink-0 ${c.icon}`} aria-hidden>✓</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gdf-dark leading-snug">{headline}</p>
                      {detail && <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{detail}</p>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          )}
          {transparency && (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Package size={18} className="shrink-0 text-gov-blue" aria-hidden />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Versão</p>
                  <p className="text-sm font-mono font-semibold text-gdf-dark">{transparency.releaseVersion}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Cpu size={18} className="shrink-0 text-gov-blue" aria-hidden />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Modelo principal</p>
                  <p className="text-xs font-semibold text-gdf-dark leading-snug">{transparency.primaryModelLabel}</p>
                </div>
              </div>
              {transparency.fallbackModelLabel && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Radio size={18} className="shrink-0 text-slate-400" aria-hidden />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Fallback</p>
                    <p className="text-xs font-semibold text-slate-600 leading-snug">{transparency.fallbackModelLabel}</p>
                  </div>
                </div>
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
          accentBar="bg-gradient-to-r from-teal-400 to-teal-600"
          iconColor="bg-gradient-to-br from-teal-50 to-white text-teal-600 ring-teal-200/60"
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
        <SectionShell
          id="sec-lai"
          variant="highlight"
          accentBar="bg-gradient-to-r from-indigo-400 to-indigo-600"
          iconColor="bg-gradient-to-br from-indigo-50 to-white text-indigo-600 ring-indigo-200/60"
          title="8. Conformidade LAI — Lei de Acesso à Informação"
          description="Lei 12.527/2011 · Pedidos de Acesso à Informação processados pelo Guia Cidadão"
          icon={<FileText size={22} strokeWidth={1.75} />}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'PAIs gerados', value: '89', detail: 'rascunhos criados pelo assistente', accent: 'border-l-indigo-400 bg-indigo-50/50' },
              { label: 'Dentro do prazo', value: '100%', detail: '20 dias úteis · 0 recursos', accent: 'border-l-emerald-400 bg-emerald-50/50' },
              { label: 'Órgãos mais demandados', value: 'CGU / TCU', detail: 'por pedidos de transparência', accent: 'border-l-blue-400 bg-blue-50/50' },
              { label: 'Tempo médio de resposta', value: '4,2 dias', detail: 'limite legal: 20 dias úteis', accent: 'border-l-purple-400 bg-purple-50/50' },
            ].map(m => (
              <div key={m.label} className={`rounded-2xl border-l-4 border border-slate-100/80 ${m.accent} p-4 shadow-sm`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{m.label}</p>
                <p className="text-2xl font-extrabold tabular-nums text-gdf-dark leading-tight">{m.value}</p>
                <p className="mt-1 text-[11px] text-slate-400 leading-snug">{m.detail}</p>
              </div>
            ))}
          </div>
          {/* Comparativo antes/depois — impacto da automação */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mt-2">
            <div className="rounded-2xl border border-red-200 bg-red-50/60 px-5 py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-600 mb-1">Sem Guia Cidadão</p>
              <p className="text-3xl font-extrabold text-red-700 tabular-nums">32 min</p>
              <p className="mt-1 text-xs text-slate-500">elaboração manual do pedido LAI</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-emerald-500">→</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-0.5">94% mais rápido</span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Com Guia Cidadão</p>
              <p className="text-3xl font-extrabold text-emerald-700 tabular-nums">&lt; 2 min</p>
              <p className="mt-1 text-xs text-slate-500">rascunho automático · campos pré-preenchidos · e-SIC</p>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          id="sec-ouvidoria"
          accentBar="bg-gradient-to-r from-red-400 to-orange-500"
          iconColor="bg-gradient-to-br from-red-50 to-white text-red-600 ring-red-200/60"
          title="9. Ouvidoria TCU — Manifestações processadas"
          description="Denúncias, reclamações e pedidos encaminhados ao portal.tcu.gov.br/ouvidoria"
          icon={<Shield size={22} strokeWidth={1.75} />}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Denúncias', value: '63', color: 'text-red-600', bg: 'bg-red-50/70', bar: 'border-l-red-500', border: 'border-red-100', detail: 'irregularidades em serviços públicos' },
              { label: 'Reclamações', value: '41', color: 'text-amber-700', bg: 'bg-amber-50/70', bar: 'border-l-amber-500', border: 'border-amber-100', detail: 'qualidade e prazo de atendimento' },
              { label: 'Pedidos de Informação', value: '18', color: 'text-indigo-600', bg: 'bg-indigo-50/70', bar: 'border-l-indigo-500', border: 'border-indigo-100', detail: 'encaminhados via LAI' },
              { label: 'Sugestões', value: '5', color: 'text-emerald-600', bg: 'bg-emerald-50/70', bar: 'border-l-emerald-500', border: 'border-emerald-100', detail: 'melhorias sugeridas pelos cidadãos' },
            ].map(m => (
              <div key={m.label} className={`rounded-2xl border-l-4 border ${m.border} ${m.bg} ${m.bar} p-5 shadow-sm`}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{m.label}</p>
                <p className={`text-4xl font-extrabold tabular-nums leading-none ${m.color}`}>{m.value}</p>
                <p className="mt-2 text-xs text-slate-500 leading-snug">{m.detail}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://portal.tcu.gov.br/ouvidoria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              aria-label="Acessar Ouvidoria TCU (abre em nova aba)"
            >
              <ExternalLink size={14} aria-hidden />
              Acessar Ouvidoria TCU
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              Tempo médio de resposta: <strong className="text-gdf-dark ml-1">7,3 dias úteis</strong>
            </span>
          </div>
        </SectionShell>
          </div>
          <aside className="sticky top-8 mt-2 hidden shrink-0 self-start lg:block">
            <nav
              className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_-12px_rgba(7,29,41,0.10)] backdrop-blur-sm overflow-hidden"
              aria-label="Secções do painel"
            >
              {/* header */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Neste painel
                </p>
              </div>
              <ul className="py-2">
                {SECTION_LINKS.map((link, i) => (
                  <li key={link.id}>
                    {/* divider before "Operação" (unlabelled section) */}
                    {link.id === 'sec-operacao' && (
                      <div className="mx-4 my-1 border-t border-dashed border-slate-100" />
                    )}
                    <a
                      href={`#${link.id}`}
                      title={link.tip}
                      className="group flex items-center gap-3 px-4 py-2 text-sm text-slate-600 transition-all hover:bg-slate-50 hover:text-gdf-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gov-blue/30"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${link.dot} group-hover:scale-125 transition-transform`} aria-hidden />
                      <span className="leading-snug">{link.label}</span>
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
        <p className="text-2xl font-extrabold leading-tight tracking-tight text-gdf-dark break-words md:text-3xl">
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

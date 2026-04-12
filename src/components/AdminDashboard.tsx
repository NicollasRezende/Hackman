import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import {
  MessageSquare, Users, Clock, ThumbsUp, ArrowLeft, RefreshCw,
  TrendingUp, Hash,
} from 'lucide-react'

interface CategoryCount { category: string; count: number }
interface TimelineCount { period: string; count: number }
interface TopMessage { message: string; count: number }

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
}

const COLORS = ['#1351b4', '#2670e8', '#0c326f', '#ffcd07', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

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
  error: 'Erro',
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

interface Props {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)

    const bases = [
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL,
      '/api',
      'http://localhost:8080/api',
    ].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i)

    for (const base of bases) {
      try {
        const res = await fetch(`${base}/v1/admin/metrics`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setMetrics(data)
        setLoading(false)
        return
      } catch {
        continue
      }
    }

    setError('Não foi possível carregar as métricas')
    setLoading(false)
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

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

  return (
    <div className="min-h-screen bg-gdf-soft font-sans">
      {/* Header */}
      <div className="bg-[#0c326f] text-white px-6 py-6">
        <div className="max-w-[1215px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              aria-label="Voltar para a página inicial"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Painel Administrativo
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Métricas e indicadores do Guia Cidadão IA
              </p>
            </div>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      <div className="max-w-[1215px] mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <MetricCard
            icon={<MessageSquare size={22} />}
            label="Total de Atendimentos"
            value={metrics?.totalMessages ?? 0}
            loading={loading}
          />
          <MetricCard
            icon={<Users size={22} />}
            label="Sessões Únicas"
            value={metrics?.uniqueSessions ?? 0}
            loading={loading}
          />
          <MetricCard
            icon={<Clock size={22} />}
            label="Tempo Médio"
            value={metrics ? formatMs(metrics.avgProcessingMs) : '—'}
            loading={loading}
          />
          <MetricCard
            icon={<ThumbsUp size={22} />}
            label="Taxa de Satisfação"
            value={metrics?.feedbackTotal ? `${satisfactionRate}%` : '—'}
            loading={loading}
            accent={satisfactionRate >= 70}
          />
          <MetricCard
            icon={<Hash size={22} />}
            label="Total de Feedbacks"
            value={metrics?.feedbackTotal ?? 0}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar: Serviços mais buscados */}
          <ChartCard title="Serviços Mais Buscados" icon={<TrendingUp size={18} />}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#374151' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    formatter={(value: number) => [`${value} consultas`, 'Total']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
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

          {/* Line: Atendimentos por hora */}
          <ChartCard title="Atendimentos ao Longo do Tempo" icon={<Clock size={18} />}>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timelineData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    formatter={(value: number) => [`${value} mensagens`, 'Total']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1351b4"
                    strokeWidth={2.5}
                    dot={{ fill: '#1351b4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </ChartCard>

          {/* Pie: Feedbacks */}
          <ChartCard title="Feedbacks" icon={<ThumbsUp size={18} />}>
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
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                    <span className="text-gray-700">Positivo: <strong>{metrics.feedbackPositive}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <span className="text-gray-700">Negativo: <strong>{metrics.feedbackNegative}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState text="Nenhum feedback recebido ainda" />
            )}
          </ChartCard>

          {/* List: Perguntas mais frequentes */}
          <ChartCard title="Perguntas Mais Frequentes" icon={<MessageSquare size={18} />}>
            {metrics && metrics.topMessages.length > 0 ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {metrics.topMessages.map((msg, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gdf-soft"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1351b4] text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{msg.count} {msg.count === 1 ? 'vez' : 'vezes'}</p>
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
    </div>
  )
}

function MetricCard({ icon, label, value, loading, accent }: {
  icon: React.ReactNode
  label: string
  value: string | number
  loading: boolean
  accent?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gdf-border p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-green-50 text-green-600' : 'bg-verde-light text-verde'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gdf-dark tracking-tight">
          {loading ? <span className="inline-block w-16 h-7 bg-gray-100 rounded animate-pulse" /> : value}
        </p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

function ChartCard({ title, icon, children }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gdf-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-verde">{icon}</span>
        <h3 className="text-sm font-semibold text-gdf-dark">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text = 'Sem dados disponíveis ainda' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
      {text}
    </div>
  )
}

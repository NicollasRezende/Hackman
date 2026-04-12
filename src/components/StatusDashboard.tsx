const DASHBOARD_STATS = [
  {
    value: '14',
    label: 'Unidades de Hospitais',
    query: 'mostrar no mapa todas as unidades hospitalares',
  },
  {
    value: '12',
    label: 'Vagas Disponíveis',
    query: 'quantas vagas',
  },
  {
    value: '342',
    label: 'Quantidade na Fila',
    query: 'quantidade na fila de hospitais',
  },
  {
    value: '98 %',
    label: 'Abastecimento de Água',
    query: 'abastecimento de agua fila',
  },
  {
    value: '1.240',
    label: 'Fila do INSS',
    query: 'filas de la monitorando inss',
  },
]

interface Props {
  onHospitalsClick?: () => void
  onMetricClick?: (query: string) => void
}

export default function StatusDashboard({ onHospitalsClick, onMetricClick }: Props) {
  return (
    <section
      className="status-dashboard-panel bg-[#0c326f] py-14 px-6 md:px-10 text-center font-sans"
      aria-labelledby="status-dashboard-heading"
    >
      <div className="max-w-[1215px] mx-auto">
        <h2 id="status-dashboard-heading" className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-12">
          Monitoramento em Tempo Real
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 mb-14">
          {DASHBOARD_STATS.map(stat => (
            <button
              key={stat.label}
              type="button"
              onClick={() =>
                stat.label === 'Unidades de Hospitais'
                  ? onHospitalsClick?.()
                  : onMetricClick?.(stat.query)
              }
              className="flex flex-col items-center group cursor-pointer w-40"
              aria-label={`${stat.label}: ${stat.value}. Abrir no assistente ou mapa de hospitais.`}
            >
              <div className="text-[44px] font-bold text-white leading-none mb-3 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white font-medium group-hover:underline underline-offset-4">
                {stat.label}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-white text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          aria-label="Mais indicadores (em desenvolvimento)"
        >
          Mais Indicadores
        </button>
      </div>
    </section>
  )
}

import type { AudienceTab } from '../types'

interface Props {
  active: AudienceTab
  onChange: (tab: AudienceTab) => void
}

const TABS: { id: AudienceTab; label: string }[] = [
  { id: 'cidadao', label: 'Sou cidadão' },
  { id: 'servidor', label: 'Sou servidor' },
  { id: 'empresa', label: 'Sou empresa' },
  { id: 'turista', label: 'Sou turista' },
  { id: 'agendamento', label: 'Agendamento' },
]

export default function AudienceTabs({ active, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gdf-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
        <nav
          className="flex flex-wrap gap-2 justify-center"
          aria-label="Filtrar serviços por perfil"
        >
          {TABS.map(tab => {
            const isAgendamento = tab.id === 'agendamento'
            const isActive = active === tab.id

            const base = 'text-sm px-4 py-2 rounded-2xl transition-all duration-150 font-medium cursor-pointer border'

            const style = isAgendamento
              ? isActive
                ? 'bg-white text-[#ED8F24] border-[#ED8F24] font-semibold shadow-sm'
                : 'bg-[#FFF8F0] text-[#ED8F24] border-[#ED8F24]/40 hover:border-[#ED8F24]'
              : isActive
                ? 'bg-white text-gov-blue border-gov-blue font-semibold shadow-sm'
                : 'bg-gov-blue-dim text-gray-600 border-transparent hover:border-gov-blue/30 hover:text-gov-blue'

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-pressed={isActive}
                aria-label={`Ver serviços para: ${tab.label}`}
                className={`${base} ${style}`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

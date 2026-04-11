import { ArrowLeft } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { FEATURED_SERVICES } from '../data/services'

interface Props {
  onServiceClick: (query: string) => void
  onBack: () => void
}

export default function AllServices({ onServiceClick, onBack }: Props) {
  return (
    <div className="max-w-[1215px] mx-auto px-6 md:px-10 py-10 min-h-screen animate-msg-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#1351b4] hover:underline font-semibold mb-8"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">Todos os Serviços</h2>
      <p className="text-gray-600 mb-10">Navegue por todos os serviços disponíveis no portal do Guia Cidadão.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURED_SERVICES.map(s => {
          const Icon = getIcon(s.icon)
          return (
            <button
              key={s.title}
              onClick={() => onServiceClick(s.query)}
              className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-[#1351b4] transition-all duration-200 flex flex-col h-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f8f8f8] group-hover:bg-[#1351b4] group-hover:text-white text-[#1351b4] flex items-center justify-center mb-4 transition-colors">
                {Icon && <Icon size={24} />}
              </div>
              <div className="font-bold text-lg text-gray-900 mb-2 leading-snug">{s.title}</div>
              <div className="text-sm text-gray-600 leading-relaxed flex-1">{s.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

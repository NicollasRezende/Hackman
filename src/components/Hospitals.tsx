import { ArrowLeft, Activity } from 'lucide-react'
import LocationsMap from './Chat/LocationsMap'
import { HOSPITAIS } from '../data/locations'

interface Props {
  onBack: () => void
}

export default function Hospitals({ onBack }: Props) {
  const totalWaiting = HOSPITAIS.reduce((acc, h) => acc + (h.hospitalData?.totalWaiting ?? 0), 0)
  const totalBeds = HOSPITAIS.reduce((acc, h) => acc + (h.hospitalData?.bedsAvailable ?? 0), 0)

  return (
    <div className="max-w-[1215px] mx-auto px-6 md:px-10 py-10 min-h-screen animate-msg-in font-sans">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#1351b4] hover:underline font-semibold mb-8"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Unidades Hospitalares do DF</h2>
          <p className="text-gray-600">
            Mapa das unidades, serviços disponíveis e indicadores de fila/triagem.
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            Dados de referência · não são operacionais em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
            <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">Fila total</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1 leading-none">{totalWaiting}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3">
            <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">Vagas</div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1 leading-none">{totalBeds}</div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-5 py-4 bg-[#f8f8f8] border-b border-gray-200">
          <Activity size={16} className="text-[#1351b4]" />
          <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
            Clique no marcador para detalhes
          </div>
        </div>
        <div className="px-4 pb-4">
          <LocationsMap locations={HOSPITAIS} />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Hospitais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOSPITAIS.map(h => (
            <div key={h.name} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">{h.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{h.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">Fila</div>
                  <div className="text-2xl font-extrabold text-gray-900 leading-none mt-1">
                    {h.hospitalData?.totalWaiting ?? 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">Vagas</div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1 leading-none">
                    {h.hospitalData?.bedsAvailable ?? 0}
                  </div>
                </div>
                <div className="flex-1 bg-[#f8f8f8] border border-gray-200 rounded-xl px-4 py-3">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-gray-600">Serviços</div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1 leading-none">
                    {h.services?.length ?? 0}
                  </div>
                </div>
              </div>

              {h.hospitalData && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-white text-green-700">
                    Verde {h.hospitalData.green}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-white text-blue-700">
                    Azul {h.hospitalData.blue}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-white text-yellow-700">
                    Amarelo {h.hospitalData.yellow}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-white text-orange-700">
                    Laranja {h.hospitalData.orange}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-white text-red-700">
                    Vermelho {h.hospitalData.red}
                  </span>
                </div>
              )}

              {h.services && h.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {h.services.slice(0, 5).map(s => (
                    <span key={s} className="text-[11px] px-2 py-1 bg-[#f8f8f8] border border-gray-200 rounded-full text-gray-800">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


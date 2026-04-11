import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Phone, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { ServiceLocation } from '../../types'
import { sortByDistance, googleMapsRouteUrl, wazeUrl } from '../../data/locations'

// Leaflet CSS — importado dinamicamente para não atrasar render inicial
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  'na-hora': { label: 'Na Hora', color: 'bg-verde-light text-verde border-verde/30' },
  'pcdf':    { label: 'PCDF',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'detran':  { label: 'DETRAN',  color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'sedet':   { label: 'SEDET',   color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'cras':    { label: 'CRAS',    color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'inss':    { label: 'INSS',    color: 'bg-red-50 text-red-700 border-red-200' },
  'ubs':     { label: 'UBS/SUS', color: 'bg-green-50 text-green-700 border-green-200' },
  'other':   { label: 'Posto',   color: 'bg-gray-50 text-gray-600 border-gray-200' },
}

const TYPE_PIN_COLOR: Record<string, string> = {
  'na-hora': '#006633',
  'pcdf':    '#1D4ED8',
  'detran':  '#C2410C',
  'sedet':   '#B45309',
  'cras':    '#7E22CE',
  'inss':    '#B91C1C',
  'ubs':     '#15803D',
  'other':   '#6B7280',
}

interface Props {
  locations: ServiceLocation[]
}

export default function LocationsMap({ locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [sorted, setSorted] = useState<ServiceLocation[]>(locations)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Load Leaflet CSS once
  useEffect(() => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
  }, [])

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // Centro padrão: Rodoviária de Brasília
      const map = L.map(mapRef.current!, {
        center: [-15.794, -47.882],
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Pins para cada local
      locations.forEach(loc => {
        const color = TYPE_PIN_COLOR[loc.type] ?? '#6B7280'
        const icon = L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.3);
            transform:rotate(-45deg);
          "></div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        })

        const badge = TYPE_BADGE[loc.type]?.label ?? 'Posto'
        const popup = `
          <div style="font-family:sans-serif;font-size:13px;min-width:180px">
            <div style="font-weight:700;margin-bottom:4px">${loc.name}</div>
            <div style="color:#6B7280;font-size:12px;margin-bottom:6px">${badge}</div>
            <div style="color:#374151">${loc.address}</div>
            ${loc.phone ? `<div style="margin-top:4px;color:#374151">📞 ${loc.phone}</div>` : ''}
            ${loc.hours  ? `<div style="color:#374151">🕐 ${loc.hours}</div>` : ''}
            <div style="margin-top:8px">
              <a href="${googleMapsRouteUrl(loc.lat, loc.lng)}" target="_blank"
                 style="color:#006633;font-weight:600;font-size:12px">
                Como chegar →
              </a>
            </div>
          </div>`

        L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .bindPopup(popup)
      })

      mapInstanceRef.current = map
      setMapReady(true)
    })
  }, [locations])

  // Geolocalização do usuário
  const handleLocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserPos({ lat, lng })
        setSorted(sortByDistance(locations, lat, lng))
        setLocating(false)

        import('leaflet').then(L => {
          const map = mapInstanceRef.current as ReturnType<typeof L.map>
          if (!map) return

          // Pino do usuário
          const userIcon = L.divIcon({
            html: `<div style="
              width:16px;height:16px;border-radius:50%;
              background:#2563EB;border:3px solid white;
              box-shadow:0 0 0 4px rgba(37,99,235,.3);
            "></div>`,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })
          L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>Você está aqui</b>')
            .openPopup()

          map.setView([lat, lng], 12)
        })
      },
      () => setLocating(false),
    )
  }

  const fmtDist = (d?: number) =>
    d == null ? null : d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`

  return (
    <div className="mt-4 rounded-2xl border border-gdf-border overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gdf-soft border-b border-gdf-border">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-verde" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#6B8B73]">
            Locais de atendimento ({locations.length})
          </span>
        </div>
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold text-verde bg-verde-light border border-verde/20 px-3 py-1.5 rounded-lg hover:bg-verde hover:text-white transition-all disabled:opacity-50"
        >
          <Navigation size={12} className={locating ? 'animate-spin' : ''} />
          {locating ? 'Localizando…' : userPos ? 'Atualizar local' : 'Perto de mim'}
        </button>
      </div>

      {/* Mapa Leaflet */}
      <div ref={mapRef} className="w-full h-52" />

      {/* Lista de locais */}
      <div className="divide-y divide-gdf-border max-h-72 overflow-y-auto">
        {sorted.map((loc, i) => {
          const badge = TYPE_BADGE[loc.type] ?? TYPE_BADGE['other']
          const dist = fmtDist(loc.distance)
          const open = expanded === loc.name

          return (
            <div key={loc.name} className="px-4 py-3">
              {/* Linha principal */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpanded(open ? null : loc.name)}
              >
                {/* Número de ordem */}
                <div className="min-w-[22px] h-[22px] rounded-full bg-verde text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">{loc.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    {dist && (
                      <span className="text-[10px] font-semibold text-[#6B8B73] bg-gdf-soft px-1.5 py-0.5 rounded-full">
                        {dist}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6B8B73] mt-0.5 truncate">{loc.address}</div>
                </div>

                <div className="text-[#6B8B73] flex-shrink-0">
                  {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>

              {/* Detalhe expandido */}
              {open && (
                <div className="mt-3 pl-[34px] space-y-2">
                  {loc.hours && (
                    <div className="flex items-center gap-2 text-xs text-[#3D5445]">
                      <Clock size={12} className="text-verde flex-shrink-0" />
                      {loc.hours}
                    </div>
                  )}
                  {loc.phone && (
                    <div className="flex items-center gap-2 text-xs text-[#3D5445]">
                      <Phone size={12} className="text-verde flex-shrink-0" />
                      {loc.phone}
                    </div>
                  )}
                  {loc.services && loc.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.services.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-gdf-soft border border-gdf-border rounded-full text-[#3D5445]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <a
                      href={googleMapsRouteUrl(loc.lat, loc.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold bg-verde text-white px-3 py-1.5 rounded-lg hover:bg-verde-med transition-all"
                    >
                      <Navigation size={11} /> Como chegar
                    </a>
                    <a
                      href={wazeUrl(loc.lat, loc.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-sky-500 text-white px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-all"
                    >
                      Waze
                    </a>
                    {loc.online && (
                      <a
                        href={loc.online}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-verde border border-verde px-3 py-1.5 rounded-lg hover:bg-verde-light transition-all"
                      >
                        <ExternalLink size={11} /> Agendar online
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

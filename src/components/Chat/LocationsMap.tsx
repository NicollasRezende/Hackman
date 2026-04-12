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
  'hospital':{ label: 'Hospital',color: 'bg-blue-50 text-[#1351b4] border-[#1351b4]/30' },
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
  'hospital':'#1351b4',
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
        let htmlContent = ''
        
        if (loc.type === 'hospital' && loc.hospitalData) {
          // Custom marker for hospital based on the gov image
          const d = loc.hospitalData
          htmlContent = `
            <div style="background:white; border: 2px solid ${color}; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); width: 140px; padding: 0; overflow: hidden; display: flex; flex-direction: column;">
              <div style="background: ${color}; color: white; font-weight: bold; font-size: 11px; padding: 4px 8px; text-align: center;">
                + ${loc.name}
              </div>
              <div style="display: flex; padding: 8px;">
                <div style="flex: 1; text-align: center; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #eee; padding-right: 4px;">
                  <div style="font-size: 10px; color: #555; line-height: 1.1; margin-bottom: 4px;">Pacientes Aguardando Atendimento</div>
                  <div style="font-size: 20px; font-weight: 800; color: #333;">${d.totalWaiting}</div>
                  <div style="font-size: 9px; color: #d97706; font-weight: bold;">agora</div>
                  <div style="font-size: 9px; color: #2563eb; font-weight: 700; margin-top: 2px;">Vagas: ${d.bedsAvailable}</div>
                </div>
                <div style="width: 30px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding-left: 4px;">
                  ${d.green > 0 ? `<div style="border: 1px solid #16a34a; color: #16a34a; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">${d.green}</div>` : ''}
                  ${d.blue > 0 ? `<div style="border: 1px solid #2563eb; color: #2563eb; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">${d.blue}</div>` : ''}
                  ${d.orange > 0 ? `<div style="border: 1px solid #ea580c; color: #ea580c; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">${d.orange}</div>` : ''}
                  ${d.yellow > 0 ? `<div style="border: 1px solid #eab308; color: #ca8a04; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">${d.yellow}</div>` : ''}
                  ${d.red > 0 ? `<div style="border: 1px solid #dc2626; color: #dc2626; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">${d.red}</div>` : ''}
                </div>
              </div>
            </div>
          `
        } else {
          htmlContent = `<div style="
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.3);
            transform:rotate(-45deg);
          "></div>`
        }

        const icon = L.divIcon({
          html: htmlContent,
          className: '',
          iconSize: loc.type === 'hospital' ? [140, 90] : [28, 28],
          iconAnchor: loc.type === 'hospital' ? [70, 90] : [14, 28],
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
    <section className="mt-4 rounded-2xl border border-gdf-border overflow-hidden bg-white" aria-label="Mapa e lista de locais de atendimento">
      <div className="flex items-center justify-between px-4 py-3 bg-gdf-soft border-b border-gdf-border">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-verde" aria-hidden />
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-600 m-0">
            Locais de atendimento ({locations.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold text-verde bg-verde-light border border-verde/20 px-3 py-1.5 rounded-lg hover:bg-verde hover:text-white transition-all disabled:opacity-50"
          aria-busy={locating}
        >
          <Navigation size={12} className={locating ? 'animate-spin' : ''} aria-hidden />
          {locating ? 'Localizando…' : userPos ? 'Atualizar local' : 'Perto de mim'}
        </button>
      </div>

      <div
        ref={mapRef}
        className={locations.some(l => l.type === 'hospital') ? 'w-full h-96' : 'w-full h-52'}
        role="region"
        aria-label="Mapa interativo com pinos dos locais de atendimento"
        tabIndex={0}
      />

      <div className="divide-y divide-gdf-border max-h-72 overflow-y-auto">
        {sorted.map((loc, i) => {
          const badge = TYPE_BADGE[loc.type] ?? TYPE_BADGE['other']
          const dist = fmtDist(loc.distance)
          const open = expanded === loc.name
          const rowId = `loc-row-${i}-${String(loc.lat)}-${String(loc.lng)}`

          return (
            <div key={rowId} className="px-4 py-3">
              <button
                type="button"
                id={`${rowId}-btn`}
                className="flex w-full items-start gap-3 text-left cursor-pointer rounded-lg p-1 -m-1 hover:bg-gdf-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-verde"
                onClick={() => setExpanded(open ? null : loc.name)}
                aria-expanded={open}
                aria-controls={`${rowId}-panel`}
              >
                <div className="min-w-[22px] h-[22px] rounded-full bg-verde text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5" aria-hidden>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">{loc.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    {dist && (
                      <span className="text-[10px] font-semibold text-gray-600 bg-gdf-soft px-1.5 py-0.5 rounded-full">
                        {dist}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 truncate">{loc.address}</div>
                </div>

                <span className="text-gray-500 flex-shrink-0 self-center" aria-hidden>
                  {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {open && (
                <section id={`${rowId}-panel`} className="mt-3 pl-[34px] space-y-2" aria-labelledby={`${rowId}-btn`}>
                  {loc.type === 'hospital' && loc.hospitalData && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-800">
                      <span
                        className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded-lg"
                        title="Valores ilustrativos para demonstração — não refletem dados operacionais em tempo real"
                      >
                        Dado de referência
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg">
                        Fila: {loc.hospitalData.totalWaiting}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg">
                        Vagas: {loc.hospitalData.bedsAvailable}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg text-green-700">
                        Verde: {loc.hospitalData.green}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg text-blue-700">
                        Azul: {loc.hospitalData.blue}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg text-yellow-700">
                        Amarelo: {loc.hospitalData.yellow}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg text-orange-700">
                        Laranja: {loc.hospitalData.orange}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gdf-soft border border-gdf-border px-2 py-1 rounded-lg text-red-700">
                        Vermelho: {loc.hospitalData.red}
                      </span>
                    </div>
                  )}
                  {loc.hours && (
                    <div className="flex items-center gap-2 text-xs text-gray-800">
                      <Clock size={12} className="text-verde flex-shrink-0" aria-hidden />
                      {loc.hours}
                    </div>
                  )}
                  {loc.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-800">
                      <Phone size={12} className="text-verde flex-shrink-0" aria-hidden />
                      {loc.phone}
                    </div>
                  )}
                  {loc.services && loc.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.services.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-gdf-soft border border-gdf-border rounded-full text-gray-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {(loc.source || loc.updatedAt) && (
                    <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-gray-600">
                      {loc.source && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gdf-border rounded-full">
                          Fonte: {loc.source}
                        </span>
                      )}
                      {loc.updatedAt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gdf-border rounded-full">
                          Atualizado em {loc.updatedAt}
                        </span>
                      )}
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
                      <Navigation size={11} aria-hidden /> Como chegar
                      <span className="sr-only"> em {loc.name}, abre em nova aba</span>
                    </a>
                    <a
                      href={wazeUrl(loc.lat, loc.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-sky-500 text-white px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-all"
                    >
                      Waze até {loc.name}
                      <span className="sr-only">, abre em nova aba</span>
                    </a>
                    {loc.online && (
                      <a
                        href={loc.online}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-verde border border-verde px-3 py-1.5 rounded-lg hover:bg-verde-light transition-all"
                      >
                        <ExternalLink size={11} aria-hidden /> Agendar online
                        <span className="sr-only"> em {loc.name}, abre em nova aba</span>
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

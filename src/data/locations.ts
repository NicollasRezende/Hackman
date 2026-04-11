import type { ServiceLocation } from '../types'

// ─────────────────────────────────────────────────────────
// Postos Na Hora — Rede de Atendimento Integrado do GDF
// ─────────────────────────────────────────────────────────
export const NA_HORA: ServiceLocation[] = [
  {
    name: 'Na Hora Rodoviária',
    type: 'na-hora',
    address: 'Plataforma Inferior, Rodoviária do Plano Piloto, Brasília',
    lat: -15.7943,
    lng: -47.8826,
    phone: '(61) 2244-1146',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'Título de Eleitor', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Taguatinga / Águas Claras',
    type: 'na-hora',
    address: 'QS 03, Lote 11, Pistão Sul, Águas Claras, Brasília',
    lat: -15.8344,
    lng: -48.0288,
    phone: '(61) 2244-1158',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho', 'Previdência'],
  },
  {
    name: 'Na Hora Ceilândia',
    type: 'na-hora',
    address: 'Shopping Popular de Ceilândia, QNM 11, Área Especial, Ceilândia Sul',
    lat: -15.8178,
    lng: -48.1043,
    phone: '(61) 2244-1164',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Gama',
    type: 'na-hora',
    address: 'Gama Shopping, Setor Central EQ 55/56, AE Leste, Gama',
    lat: -16.0108,
    lng: -48.0620,
    phone: '(61) 2104-1563',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Sobradinho',
    type: 'na-hora',
    address: 'Quadra 6, Área Especial 8, Sobradinho',
    lat: -15.6538,
    lng: -47.7908,
    phone: '(61) 2244-1170',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Samambaia',
    type: 'na-hora',
    address: 'QN 303, Área Especial, Samambaia Norte',
    lat: -15.8769,
    lng: -48.0800,
    phone: '(61) 2244-1172',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Riacho Fundo',
    type: 'na-hora',
    address: 'Shopping Riacho Mall, QN 7, Área Especial 1, Riacho Fundo I',
    lat: -15.8897,
    lng: -48.0239,
    phone: '(61) 2244-1143',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'DETRAN', 'Trabalho'],
  },
  {
    name: 'Na Hora Brazlândia',
    type: 'na-hora',
    address: 'Área Especial 4, Lote 3, Setor Tradicional, Brazlândia',
    lat: -15.6736,
    lng: -48.2016,
    phone: '(61) 2244-1176',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'CNH', 'Trabalho'],
  },
  {
    name: 'Na Hora Venâncio 2000',
    type: 'na-hora',
    address: 'SCRS 514, Bloco B, Lj 60, Venâncio 2000, Asa Sul, Brasília',
    lat: -15.8042,
    lng: -47.9021,
    phone: '(61) 2244-1148',
    hours: 'Seg–Sex 7h30–19h | Sáb 7h30–13h',
    services: ['RG/CIN', 'CPF', 'Título de Eleitor', 'CNH', 'DETRAN', 'Trabalho', 'INSS'],
  },
]

// ─────────────────────────────────────────────────────────
// PCDF / SSP-DF — Polícia Civil (emissão de RG)
// ─────────────────────────────────────────────────────────
export const PCDF: ServiceLocation[] = [
  {
    name: 'Instituto de Identificação — PCDF (Central)',
    type: 'pcdf',
    address: 'SDS — Setor de Diversões Sul, Ed. Venâncio III, Sl. 1, Brasília',
    lat: -15.7987,
    lng: -47.8938,
    phone: '(61) 3362-6950',
    hours: 'Seg–Sex 7h–17h',
    services: ['RG/CIN (primeira via)', 'RG/CIN (segunda via)', 'Certidão de Antecedentes'],
    online: 'https://agenda.df.gov.br',
  },
  {
    name: 'Delegacia Eletrônica (DEL) — PCDF Online',
    type: 'pcdf',
    address: 'Atendimento 100% online',
    lat: -15.7800,
    lng: -47.9292,
    phone: '197',
    hours: '24 horas',
    services: ['Boletim de Ocorrência online', 'Certidão de Antecedentes'],
    online: 'https://www.pcdf.df.gov.br/servicos/delegacia-eletronica',
  },
]

// ─────────────────────────────────────────────────────────
// DETRAN-DF — Habilitação e Trânsito
// ─────────────────────────────────────────────────────────
export const DETRAN: ServiceLocation[] = [
  {
    name: 'DETRAN-DF Central',
    type: 'detran',
    address: 'SEPN 515, Bloco B, Asa Norte, Brasília',
    lat: -15.7540,
    lng: -47.8910,
    phone: '154',
    hours: 'Seg–Sex 7h–17h',
    services: ['CNH (1ª habilitação)', 'Renovação CNH', '2ª via CNH', 'Vistoria', 'Licenciamento'],
    online: 'https://portal.detran.df.gov.br',
  },
  {
    name: 'DETRAN-DF Taguatinga',
    type: 'detran',
    address: 'QSA 6, Lote 2, Taguatinga Sul',
    lat: -15.8427,
    lng: -48.0552,
    phone: '154',
    hours: 'Seg–Sex 7h–17h',
    services: ['CNH', 'Vistoria', 'Licenciamento'],
    online: 'https://portal.maestro.detran.df.gov.br/agendamento/',
  },
  {
    name: 'DETRAN-DF Ceilândia',
    type: 'detran',
    address: 'QNM 2, Módulo A, Ceilândia Norte',
    lat: -15.8090,
    lng: -48.1038,
    phone: '154',
    hours: 'Seg–Sex 7h–17h',
    services: ['CNH', 'Vistoria', 'Licenciamento'],
    online: 'https://portal.maestro.detran.df.gov.br/agendamento/',
  },
  {
    name: 'DETRAN-DF Gama',
    type: 'detran',
    address: 'Setor Leste, EQ 55/56, Gama',
    lat: -16.0142,
    lng: -48.0596,
    phone: '154',
    hours: 'Seg–Sex 7h–17h',
    services: ['CNH', 'Vistoria', 'Licenciamento'],
    online: 'https://portal.maestro.detran.df.gov.br/agendamento/',
  },
]

// ─────────────────────────────────────────────────────────
// SEDET / SINE — Emprego e Trabalho
// ─────────────────────────────────────────────────────────
export const SEDET: ServiceLocation[] = [
  {
    name: 'Agência do Trabalhador — Brasília (Central)',
    type: 'sedet',
    address: 'SCS, Quadra 8, Ed. Venâncio 2000, Brasília',
    lat: -15.8040,
    lng: -47.9018,
    phone: '158',
    hours: 'Seg–Sex 7h–17h',
    services: ['Seguro-Desemprego', 'Carteira de Trabalho', 'Emprego', 'Qualificação'],
    online: 'https://www.sedet.df.gov.br',
  },
  {
    name: 'Agência do Trabalhador — Taguatinga',
    type: 'sedet',
    address: 'QS 03, Pistão Sul, Taguatinga, Brasília',
    lat: -15.8320,
    lng: -48.0244,
    phone: '158',
    hours: 'Seg–Sex 7h–17h',
    services: ['Seguro-Desemprego', 'Emprego', 'Qualificação'],
    online: 'https://www.sedet.df.gov.br',
  },
  {
    name: 'Agência do Trabalhador — Ceilândia',
    type: 'sedet',
    address: 'QNM 11, Ceilândia Norte, Brasília',
    lat: -15.8150,
    lng: -48.1010,
    phone: '158',
    hours: 'Seg–Sex 7h–17h',
    services: ['Seguro-Desemprego', 'Emprego', 'Qualificação'],
    online: 'https://www.sedet.df.gov.br',
  },
]

// ─────────────────────────────────────────────────────────
// CRAS — Assistência Social (Bolsa Família, BPC, CadÚnico)
// ─────────────────────────────────────────────────────────
export const CRAS: ServiceLocation[] = [
  {
    name: 'CRAS Asa Norte',
    type: 'cras',
    address: 'SGAN 910, Módulo D, Asa Norte, Brasília',
    lat: -15.7615,
    lng: -47.8878,
    phone: '156',
    hours: 'Seg–Sex 8h–17h',
    services: ['CadÚnico', 'Bolsa Família', 'BPC', 'Assistência Social'],
    online: 'https://www.sedes.df.gov.br/agendaratendimento',
  },
  {
    name: 'CRAS Asa Sul',
    type: 'cras',
    address: 'SGAS 910, Conjunto B, Asa Sul, Brasília',
    lat: -15.8215,
    lng: -47.9010,
    phone: '156',
    hours: 'Seg–Sex 8h–17h',
    services: ['CadÚnico', 'Bolsa Família', 'BPC', 'Assistência Social'],
    online: 'https://www.sedes.df.gov.br/agendaratendimento',
  },
  {
    name: 'CRAS Ceilândia Norte',
    type: 'cras',
    address: 'QNN 28, Área Especial, Ceilândia Norte',
    lat: -15.7940,
    lng: -48.1067,
    phone: '156',
    hours: 'Seg–Sex 8h–17h',
    services: ['CadÚnico', 'Bolsa Família', 'BPC', 'Assistência Social'],
    online: 'https://www.sedes.df.gov.br/agendaratendimento',
  },
  {
    name: 'CRAS Taguatinga Norte',
    type: 'cras',
    address: 'QNC 3, Conjunto A, Taguatinga Norte',
    lat: -15.8124,
    lng: -48.0556,
    phone: '156',
    hours: 'Seg–Sex 8h–17h',
    services: ['CadÚnico', 'Bolsa Família', 'BPC', 'Assistência Social'],
    online: 'https://www.sedes.df.gov.br/agendaratendimento',
  },
  {
    name: 'CRAS Samambaia',
    type: 'cras',
    address: 'QN 124, Conjunto 3, Samambaia Norte',
    lat: -15.8720,
    lng: -48.0754,
    phone: '156',
    hours: 'Seg–Sex 8h–17h',
    services: ['CadÚnico', 'Bolsa Família', 'BPC', 'Assistência Social'],
    online: 'https://www.sedes.df.gov.br/agendaratendimento',
  },
]

// ─────────────────────────────────────────────────────────
// INSS — Previdência
// ─────────────────────────────────────────────────────────
export const INSS: ServiceLocation[] = [
  {
    name: 'INSS — Brasília Centro',
    type: 'inss',
    address: 'SGAS 910, Bloco B, Asa Sul, Brasília',
    lat: -15.8195,
    lng: -47.9021,
    phone: '135',
    hours: 'Seg–Sex 7h–17h',
    services: ['Aposentadoria', 'BPC', 'Auxílio Doença', 'Salário Maternidade'],
    online: 'https://meu.inss.gov.br',
  },
  {
    name: 'INSS — Taguatinga',
    type: 'inss',
    address: 'CNB 03, Lote 11, Taguatinga Norte',
    lat: -15.8154,
    lng: -48.0548,
    phone: '135',
    hours: 'Seg–Sex 7h–17h',
    services: ['Aposentadoria', 'BPC', 'Auxílio Doença'],
    online: 'https://meu.inss.gov.br',
  },
]

// ─────────────────────────────────────────────────────────
// Helpers — conjuntos por caso de uso
// ─────────────────────────────────────────────────────────

/** Locais para emissão de RG/CIN (Identidade) */
export const LOCATIONS_IDENTIDADE: ServiceLocation[] = [
  ...PCDF,
  ...NA_HORA,
]

/** Locais para CNH / serviços DETRAN */
export const LOCATIONS_CNH: ServiceLocation[] = [
  ...DETRAN,
  ...NA_HORA.filter(l => l.services?.includes('CNH')),
]

/** Locais para Seguro-Desemprego / Emprego */
export const LOCATIONS_TRABALHO: ServiceLocation[] = [
  ...SEDET,
  ...NA_HORA.filter(l => l.services?.includes('Trabalho')),
]

/** Locais para Bolsa Família / CadÚnico / BPC */
export const LOCATIONS_SOCIAL: ServiceLocation[] = [
  ...CRAS,
]

/** Locais para Aposentadoria / Previdência */
export const LOCATIONS_PREVIDENCIA: ServiceLocation[] = [
  ...INSS,
  ...NA_HORA.filter(l => l.services?.includes('INSS')),
]

/** Calcula distância em km entre duas coordenadas (Haversine) */
export function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Ordena locais por distância do ponto do usuário */
export function sortByDistance(
  locations: ServiceLocation[],
  userLat: number,
  userLng: number,
): ServiceLocation[] {
  return locations
    .map(l => ({ ...l, distance: calcDistance(userLat, userLng, l.lat, l.lng) }))
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
}

/** Gera URL do Google Maps para rota a pé/transporte */
export function googleMapsRouteUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
}

/** Gera URL do Waze */
export function wazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

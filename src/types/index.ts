export interface InfoBlock {
  icon: string
  title: string
  body?: string
  docs?: string[]
}

export interface ContactInfo {
  title: string
  addr: string
  phone: string
  hours: string
}

<<<<<<< HEAD
=======
export type LocationType = 'na-hora' | 'pcdf' | 'detran' | 'ubs' | 'cras' | 'sedet' | 'inss' | 'other'

export interface ServiceLocation {
  name: string
  type: LocationType
  address: string
  lat: number
  lng: number
  phone?: string
  hours?: string
  services?: string[]    // ex: ['RG', 'CPF', 'Título de Eleitor']
  online?: string        // URL para serviço digital equivalente
  distance?: number      // km — calculado no frontend após geolocalização
}

>>>>>>> origin/main
export interface AIResponse {
  keys: string[]
  tag: { cls: string; icon: string; txt: string }
  intro: string
  blocks: InfoBlock[]
  steps: string[]
  tip?: string
  contact?: ContactInfo
<<<<<<< HEAD
=======
  locations?: ServiceLocation[]   // postos de atendimento com mapa
>>>>>>> origin/main
  related?: string[]
}

export interface ServiceCard {
  icon: string
  title: string
  desc: string
  badges: Array<{ label: string; variant: 'green' | 'blue' | 'ouro' }>
  stat: { icon: string; text: string }
  cta: string
  query: string
}

export interface StatusCard {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  pill: { text: string; variant: 'green' | 'yellow' | 'red' }
  value: string
  detail: string
}

export interface Message {
  id: string
  type: 'user' | 'ai'
  text: string
  data?: AIResponse | null
}

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

export type LocationType =
  | 'na-hora'
  | 'pcdf'
  | 'detran'
  | 'ubs'
  | 'cras'
  | 'sedet'
  | 'inss'
  | 'hospital'
  | 'other'

export interface ServiceLocation {
  name: string
  type: LocationType
  address: string
  lat: number
  lng: number
  phone?: string
  hours?: string
  services?: string[]
  online?: string
  distance?: number
  hospitalData?: {
    totalWaiting: number
    bedsAvailable: number
    green: number
    blue: number
    yellow: number
    orange: number
    red: number
  }
}
export interface ResponseMeta {
  sessionId?: string
  responseId?: string
  model?: string
  processingMs?: number
  timestamp?: string
}

export interface OfficialLink {
  label: string
  url: string
  source?: string
}

export interface AIResponse {
  keys?: string[]
  tag: { cls: string; icon: string; txt: string }
  intro: string
  blocks: InfoBlock[]
  steps: string[]
  tip?: string
  contact?: ContactInfo
  locations?: ServiceLocation[]
  related?: string[]
  official?: OfficialLink
  meta?: ResponseMeta
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

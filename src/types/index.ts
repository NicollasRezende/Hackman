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

export interface AIResponse {
  keys: string[]
  tag: { cls: string; icon: string; txt: string }
  intro: string
  blocks: InfoBlock[]
  steps: string[]
  tip?: string
  contact?: ContactInfo
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

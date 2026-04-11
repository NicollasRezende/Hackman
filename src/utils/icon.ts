import type { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'

export function getIcon(name: string): LucideIcon | null {
  return (Icons as unknown as Record<string, LucideIcon>)[name] ?? null
}

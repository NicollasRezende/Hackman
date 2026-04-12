import { useState } from 'react'
import { Megaphone, Calendar, Info, X } from 'lucide-react'

export default function AlertBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Avisos institucionais"
      className="bg-ouro-bg border-b border-ouro-border px-10 py-2 flex items-center gap-3 text-xs"
    >
      <div className="flex gap-7 items-center flex-1 overflow-hidden">
        <span className="flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
          <Megaphone size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
          <strong>IPTU 2026:</strong> Parcela de abril vence em 30/04. Emita seu boleto aqui.
        </span>
        <span className="text-ouro-border hidden md:block" aria-hidden>
          ·
        </span>
        <span className="hidden md:flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
          <Calendar size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
          <strong>IR 2026:</strong> Prazo final para declaração: 30 de maio.
        </span>
        <span className="text-ouro-border hidden lg:block" aria-hidden>
          ·
        </span>
        <span className="hidden lg:flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
          <Info size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
          Novo: Agendamento de Habite-se 100% online.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-yellow-700 hover:text-yellow-900 transition-colors flex-shrink-0 rounded-lg p-1"
        aria-label="Fechar barra de avisos"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  )
}

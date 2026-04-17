import { BookOpen, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/trilha-clara', label: 'Dashboard' },
  { to: '/trilha-clara/nova-analise', label: 'Nova Análise' },
]

export default function TrilhaNav({ onLogout }: { onLogout: () => void }) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-trilha text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/trilha-clara" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen size={24} />
          Trilha Clara
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-indigo-200 ${
                pathname === l.to ? 'text-white underline underline-offset-4' : 'text-indigo-200'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/20"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/20 px-4 pb-4 md:hidden">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-indigo-100 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="mt-2 flex items-center gap-1 text-sm text-indigo-200 hover:text-white"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </nav>
  )
}

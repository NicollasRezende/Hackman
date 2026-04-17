import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-trilha-light via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-trilha text-white shadow-lg">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trilha Clara</h1>
          <p className="mt-2 text-gray-500">
            Enxergue o processo de aprendizagem por trás do trabalho entregue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-trilha-border bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Entrar na plataforma</h2>

          <form
            onSubmit={e => {
              e.preventDefault()
              onLogin()
            }}
          >
            <label className="mb-1 block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              defaultValue="professor@escola.edu.br"
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-trilha focus:ring-2 focus:ring-trilha/20"
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative mb-6">
              <input
                type={showPw ? 'text' : 'password'}
                defaultValue="123456"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-trilha focus:ring-2 focus:ring-trilha/20"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-trilha py-2.5 text-sm font-semibold text-white shadow transition hover:bg-trilha-dark"
            >
              Entrar
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            MVP — Hackathon 2026
          </p>
        </div>
      </div>
    </div>
  )
}

import { Landmark, Contrast, Type, LogIn } from 'lucide-react'

export default function IdentityBar() {
  return (
    <div className="bg-gdf-soft border-b border-gdf-border px-6 md:px-10 h-10 hidden md:flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 font-semibold text-gdf-dark border-r border-gdf-border pr-3">
          <div className="w-5 h-5 rounded bg-verde flex items-center justify-center">
            <Landmark size={11} className="text-white" />
          </div>
          Governo do Distrito Federal
        </div>
        <span className="truncate">Portal Oficial de Serviços ao Cidadão</span>
      </div>
      <div className="flex items-center gap-5">
        {[
          { icon: Contrast, label: 'Alto contraste' },
          { icon: Type, label: 'Libras' },
          { icon: LogIn, label: 'Entrar com gov.br' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex items-center gap-1 text-gray-600 hover:text-verde hover:underline underline-offset-4 transition-colors"
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

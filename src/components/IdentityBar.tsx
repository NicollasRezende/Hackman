import { Landmark, Contrast, Type, LogIn } from 'lucide-react'

export default function IdentityBar() {
  return (
    <div className="bg-gdf-soft border-b border-gdf-border px-10 py-1.5 hidden md:flex items-center justify-between text-xs text-[#6B8B73]">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 font-bold text-verde border-r border-gdf-border pr-2.5">
          <div className="w-5 h-5 rounded bg-verde flex items-center justify-center">
            <Landmark size={11} className="text-white" />
          </div>
          Governo do Distrito Federal
        </div>
        <span>Portal Oficial de Serviços ao Cidadão</span>
      </div>
      <div className="flex items-center gap-4">
        {[
          { icon: Contrast, label: 'Alto contraste' },
          { icon: Type, label: 'Libras' },
          { icon: LogIn, label: 'Entrar com gov.br' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-1 hover:text-verde transition-colors"
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

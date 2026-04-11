<<<<<<< HEAD
import { Contrast, Grid2X2, Languages, LogIn } from 'lucide-react'

export default function IdentityBar() {
  return (
    <div className="hidden border-b border-gov-blue-line bg-white md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-10">
          <a href="#" className="text-[3rem] font-black leading-none tracking-[-0.08em] text-gov-blue" aria-label="gov.br">
            <span className="text-gov-blue">gov</span>
            <span className="text-[#f6c800]">.</span>
            <span className="text-[#34a853]">b</span>
            <span className="text-gov-blue">r</span>
          </a>
          <div className="flex items-center gap-8 text-sm text-gov-blue">
            <button className="hover:underline">Órgãos do Governo</button>
            <button className="hover:underline">Acesso à Informação</button>
            <button className="hover:underline">Legislação</button>
            <button className="hover:underline">Acessibilidade</button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gov-blue">
          <button className="font-semibold hover:underline">PT</button>
          <button className="transition-colors hover:text-gov-blue-dark" aria-label="Alto contraste">
            <Contrast size={18} />
          </button>
          <button className="transition-colors hover:text-gov-blue-dark" aria-label="Libras">
            <Languages size={18} />
          </button>
          <button className="transition-colors hover:text-gov-blue-dark" aria-label="Aplicativos">
            <Grid2X2 size={18} />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-gov-blue px-5 py-2.5 font-semibold text-white transition-colors hover:bg-gov-blue-dark">
            <LogIn size={16} />
            Entrar com gov.br
          </button>
        </div>
=======
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
>>>>>>> origin/main
      </div>
    </div>
  )
}

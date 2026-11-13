import { BarraTopo } from '@/components/elo/barra-topo'
import { Lateral } from '@/components/elo/lateral'
import { obterUsuarioAtual } from '@/lib/dados/usuario'

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = obterUsuarioAtual()
  return (
    <div className="flex min-h-dvh">
      <Lateral usuario={usuario} />
      <div className="min-w-0 flex-1">
        <BarraTopo usuario={usuario} />
        <main className="px-6 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

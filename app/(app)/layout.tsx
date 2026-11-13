import { Suspense } from 'react'
import { BarraTopo, BarraTopoEstatica } from '@/components/elo/barra-topo'
import { Lateral, LateralEstatica } from '@/components/elo/lateral'
import { obterUsuarioAtual } from '@/lib/dados/usuario'

// Escondido até receber o foco do teclado; então aparece no canto, por cima da tela.
const PULAR_PARA_O_CONTEUDO =
  'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary focus:shadow-[var(--shadow-flutuante)]'

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <a href="#conteudo" className={PULAR_PARA_O_CONTEUDO}>
        Pular para o conteúdo
      </a>
      <Suspense>
        <LateralDoUsuario />
      </Suspense>
      <div className="min-w-0 flex-1">
        <Suspense>
          <BarraTopoDoUsuario />
        </Suspense>
        <main id="conteudo" tabIndex={-1} className="px-6 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// Com o cacheComponents, o usePathname do menu suspende em rota dinâmica que o generateStaticParams
// não cobre (docs do Next, use-pathname, "Cache Components"); sem Suspense a build falha. Enquanto
// a rota não é conhecida, aparece a mesma estrutura sem o item atual marcado.
// O usuário é lido dentro do Suspense de fora: quando vier da sessão (cookies(), assíncrono),
// a leitura não segura o conteúdo da página.

async function LateralDoUsuario() {
  const usuario = await obterUsuarioAtual()
  return (
    <Suspense fallback={<LateralEstatica usuario={usuario} />}>
      <Lateral usuario={usuario} />
    </Suspense>
  )
}

async function BarraTopoDoUsuario() {
  const usuario = await obterUsuarioAtual()
  return (
    <Suspense fallback={<BarraTopoEstatica usuario={usuario} />}>
      <BarraTopo usuario={usuario} />
    </Suspense>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoPlano } from './_componentes/conteudo-plano'

// Título fixo: ler o plano no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Plano de ação | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaPlano({ params }: PageProps<'/planos/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoPlano params={params} />
      </Suspense>
    </div>
  )
}

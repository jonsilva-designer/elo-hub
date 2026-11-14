import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoAvaliacao } from './_componentes/conteudo-avaliacao'

// Título fixo: ler a avaliação no generateMetadata exigiria a sessão. O cliente aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Avaliação de maturidade | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaAvaliacao({ params }: PageProps<'/avaliacoes/[id]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoAvaliacao params={params} />
      </Suspense>
    </div>
  )
}

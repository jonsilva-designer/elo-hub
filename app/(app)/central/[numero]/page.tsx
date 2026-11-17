import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Carregando } from '@/components/elo/estados'
import { ConteudoDemanda } from './_componentes/conteudo-demanda'

// Título fixo: ler a demanda no generateMetadata exigiria a sessão. O número e o assunto aparecem no cabeçalho.
export const metadata: Metadata = { title: 'Demanda | Plataforma ELO' }

// O número da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaDemanda({ params }: PageProps<'/central/[numero]'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense fallback={<Carregando />}>
        <ConteudoDemanda params={params} />
      </Suspense>
    </div>
  )
}

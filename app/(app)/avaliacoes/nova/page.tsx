import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovaAvaliacao } from './_componentes/conteudo-nova-avaliacao'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Nova avaliação | Plataforma ELO' }

// O cliente vem do endereço (?cliente=) e a página lê a sessão: tudo dentro do Suspense (cacheComponents).
export default function PaginaNovaAvaliacao({ searchParams }: PageProps<'/avaliacoes/nova'>) {
  return (
    <div className="w-full max-w-4xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Nova avaliação" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovaAvaliacao searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

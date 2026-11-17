import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoCentral } from './_componentes/conteudo-central'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Central ELO | Plataforma ELO' }

// A fila lê a sessão, a data de hoje e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaCentral({ searchParams }: PageProps<'/central'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Central ELO" />
            <Carregando />
          </>
        }
      >
        <ConteudoCentral searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

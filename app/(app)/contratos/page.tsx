import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoContratos } from './_componentes/conteudo-contratos'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Contratos | Plataforma ELO' }

// A lista lê a sessão e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaContratos({ searchParams }: PageProps<'/contratos'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Contratos" />
            <Carregando />
          </>
        }
      >
        <ConteudoContratos searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

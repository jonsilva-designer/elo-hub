import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoClientes } from './_componentes/conteudo-clientes'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Clientes | Plataforma ELO' }

// A lista lê a sessão e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaClientes({ searchParams }: PageProps<'/clientes'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Clientes" />
            <Carregando />
          </>
        }
      >
        <ConteudoClientes searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

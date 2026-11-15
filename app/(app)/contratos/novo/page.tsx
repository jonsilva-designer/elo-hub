import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoContrato } from './_componentes/conteudo-novo-contrato'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo contrato | Plataforma ELO' }

// A página lê a sessão e o cliente do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoContrato({ searchParams }: PageProps<'/contratos/novo'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Novo contrato" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoContrato searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

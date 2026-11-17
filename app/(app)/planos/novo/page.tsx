import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoPlano } from './_componentes/conteudo-novo-plano'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo plano | Plataforma ELO' }

// A página lê a sessão e o escopo do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoPlano({ searchParams }: PageProps<'/planos/novo'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Novo plano" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoPlano searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

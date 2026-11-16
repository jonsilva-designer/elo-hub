import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoEscopo } from './_componentes/conteudo-novo-escopo'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo escopo | Plataforma ELO' }

// A página lê a sessão e o contrato do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoEscopo({ searchParams }: PageProps<'/escopos/novo'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Novo escopo" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoEscopo searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

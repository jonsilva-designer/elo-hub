import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoDocumento } from './_componentes/conteudo-novo-documento'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Incluir documento | Plataforma ELO' }

// A página lê a sessão e o vínculo do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoDocumento({ searchParams }: PageProps<'/documentos/novo'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Incluir documento" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoDocumento searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

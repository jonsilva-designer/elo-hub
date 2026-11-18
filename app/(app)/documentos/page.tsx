import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoDocumentos } from './_componentes/conteudo-documentos'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Documentos | Plataforma ELO' }

// A lista lê a sessão e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaDocumentos({ searchParams }: PageProps<'/documentos'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Documentos" />
            <Carregando />
          </>
        }
      >
        <ConteudoDocumentos searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

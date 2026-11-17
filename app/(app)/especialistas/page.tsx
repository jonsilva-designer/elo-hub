import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEspecialistas } from './_componentes/conteudo-especialistas'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Especialistas | Plataforma ELO' }

// A lista lê a sessão e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaEspecialistas({ searchParams }: PageProps<'/especialistas'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Especialistas" />
            <Carregando />
          </>
        }
      >
        <ConteudoEspecialistas searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

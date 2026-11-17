import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoMinhasAtividades } from './_componentes/conteudo-minhas-atividades'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Minhas atividades | Plataforma ELO' }

// A lista lê a sessão, a data de hoje e os filtros do endereço, então tudo fica dentro do Suspense (cacheComponents).
export default function PaginaMinhasAtividades({ searchParams }: PageProps<'/minhas-atividades'>) {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Minhas atividades" />
            <Carregando />
          </>
        }
      >
        <ConteudoMinhasAtividades searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

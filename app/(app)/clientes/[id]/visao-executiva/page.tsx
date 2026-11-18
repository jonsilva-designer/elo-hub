import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoVisaoExecutiva } from './_componentes/conteudo-visao-executiva'

// Título fixo: ler o cliente no generateMetadata exigiria a sessão. O nome aparece no cabeçalho da página.
export const metadata: Metadata = { title: 'Visão Executiva | Plataforma ELO' }

// O id da rota, o filtro e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaVisaoExecutiva({ params, searchParams }: PageProps<'/clientes/[id]/visao-executiva'>) {
  return (
    <div className="w-full max-w-7xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Visão Executiva" />
            <Carregando />
          </>
        }
      >
        <ConteudoVisaoExecutiva params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

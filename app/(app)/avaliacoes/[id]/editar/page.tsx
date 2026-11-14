import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarAvaliacao } from './_componentes/conteudo-editar-avaliacao'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar avaliação | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarAvaliacao({ params }: PageProps<'/avaliacoes/[id]/editar'>) {
  return (
    <div className="w-full max-w-4xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar avaliação" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarAvaliacao params={params} />
      </Suspense>
    </div>
  )
}

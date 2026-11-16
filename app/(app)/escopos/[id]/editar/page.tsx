import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarEscopo } from './_componentes/conteudo-editar-escopo'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar escopo | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarEscopo({ params }: PageProps<'/escopos/[id]/editar'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar escopo" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarEscopo params={params} />
      </Suspense>
    </div>
  )
}

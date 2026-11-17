import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarAtividade } from './_componentes/conteudo-editar-atividade'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar atividade | Plataforma ELO' }

// O id da rota, a origem e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarAtividade({ params, searchParams }: PageProps<'/atividades/[id]/editar'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar atividade" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarAtividade params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

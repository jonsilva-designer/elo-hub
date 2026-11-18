import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarDocumento } from './_componentes/conteudo-editar-documento'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar documento | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarDocumento({ params }: PageProps<'/documentos/[id]/editar'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar documento" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarDocumento params={params} />
      </Suspense>
    </div>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarCliente } from './_componentes/conteudo-editar-cliente'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar cliente | Plataforma ELO' }

// O id da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarCliente({ params }: PageProps<'/clientes/[id]/editar'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar cliente" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarCliente params={params} />
      </Suspense>
    </div>
  )
}

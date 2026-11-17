import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoEditarDemanda } from './_componentes/conteudo-editar-demanda'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Editar demanda | Plataforma ELO' }

// O número da rota e a sessão só podem ser lidos dentro do Suspense (cacheComponents).
export default function PaginaEditarDemanda({ params }: PageProps<'/central/[numero]/editar'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Editar demanda" />
            <Carregando />
          </>
        }
      >
        <ConteudoEditarDemanda params={params} />
      </Suspense>
    </div>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovaDemanda } from './_componentes/conteudo-nova-demanda'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Nova demanda | Plataforma ELO' }

// A página lê a sessão, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovaDemanda() {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Nova demanda" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovaDemanda />
      </Suspense>
    </div>
  )
}

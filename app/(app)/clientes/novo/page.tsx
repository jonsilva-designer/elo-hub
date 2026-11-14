import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoCliente } from './_componentes/conteudo-novo-cliente'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo cliente | Plataforma ELO' }

// A página lê a sessão para saber o perfil, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoCliente() {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Novo cliente" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoCliente />
      </Suspense>
    </div>
  )
}

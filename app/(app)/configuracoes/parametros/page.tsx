import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoParametros } from './_componentes/conteudo-parametros'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Parâmetros | Plataforma ELO' }

// A tela lê a sessão, então fica dentro do Suspense (cacheComponents).
export default function PaginaParametros() {
  return (
    <div className="w-full max-w-4xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Configurações" />
            <Carregando />
          </>
        }
      >
        <ConteudoParametros />
      </Suspense>
    </div>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoUsuarios } from './_componentes/conteudo-usuarios'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Usuários | Plataforma ELO' }

// A lista lê a sessão, então fica dentro do Suspense (cacheComponents).
export default function PaginaUsuarios() {
  return (
    <div className="w-full max-w-6xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Configurações" />
            <Carregando />
          </>
        }
      >
        <ConteudoUsuarios />
      </Suspense>
    </div>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoListas } from './_componentes/conteudo-listas'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Listas oficiais | Plataforma ELO' }

// A tela lê a sessão e a lista do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaListas({ searchParams }: PageProps<'/configuracoes/listas'>) {
  return (
    <div className="w-full max-w-5xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Configurações" />
            <Carregando />
          </>
        }
      >
        <ConteudoListas searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

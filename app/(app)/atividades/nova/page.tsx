import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovaAtividade } from './_componentes/conteudo-nova-atividade'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Nova atividade | Plataforma ELO' }

// A página lê a sessão e o plano do endereço, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovaAtividade({ searchParams }: PageProps<'/atividades/nova'>) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Nova atividade" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovaAtividade searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

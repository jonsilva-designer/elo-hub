import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoInicio } from './_componentes/conteudo-inicio'
import { DataDeHoje } from './_componentes/data-de-hoje'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Início | Plataforma ELO' }

// O painel lê a sessão e a data de hoje, então fica dentro do Suspense (cacheComponents).
export default function PaginaInicio() {
  return (
    <div className="w-full max-w-6xl">
      <CabecalhoPagina
        titulo="Início"
        contexto={
          // A espera ocupa o mesmo espaço da data, para a linha não pular quando ela chega.
          <Suspense fallback={<span className="invisible font-mono">00/00/0000</span>}>
            <DataDeHoje />
          </Suspense>
        }
      />
      <Suspense fallback={<Carregando />}>
        <ConteudoInicio />
      </Suspense>
    </div>
  )
}

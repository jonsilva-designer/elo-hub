import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { EstadoVazio } from '@/components/elo/estados'
import { DataDeHoje } from './_componentes/data-de-hoje'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Início | Plataforma ELO' }

// Início provisório da parte 1. A parte 7 o substitui pelo painel com os alertas (F13, F15).
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
      <EstadoVazio
        titulo="Em construção"
        descricao="O painel com os alertas do dia entra numa próxima parte do protótipo."
      />
    </div>
  )
}

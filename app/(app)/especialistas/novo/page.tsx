import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Carregando } from '@/components/elo/estados'
import { ConteudoNovoEspecialista } from './_componentes/conteudo-novo-especialista'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Novo especialista | Plataforma ELO' }

// A página lê a sessão, então fica dentro do Suspense (cacheComponents).
export default function PaginaNovoEspecialista() {
  return (
    <div className="w-full max-w-3xl">
      <Suspense
        fallback={
          <>
            <CabecalhoPagina titulo="Novo especialista" />
            <Carregando />
          </>
        }
      >
        <ConteudoNovoEspecialista />
      </Suspense>
    </div>
  )
}

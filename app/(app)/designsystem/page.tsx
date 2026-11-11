import type { Metadata } from 'next'
import { Acoes } from './_secoes/acoes'
import { Exibicao } from './_secoes/exibicao'
import { Fundamentos } from './_secoes/fundamentos'
import { Marca } from './_secoes/marca'
import { Retorno } from './_secoes/retorno'
import { Secao } from './_secoes/secao'
import { Tipografia } from './_secoes/tipografia'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Padrão visual | Plataforma ELO' }

export default function PaginaDesignSystem() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="space-y-1 border-b border-[var(--elo-dourado-suave)] pb-4">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--elo-azul-marinho)]">
          Padrão visual
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Cores, tipografia e componentes da Plataforma ELO, com dados fictícios.
        </p>
      </header>

      <Marca />
      <Tipografia />
      <Fundamentos />
      <Secao
        titulo="Componentes"
        descricao="Cada componente com as suas variações e estados, lado a lado."
      >
        <div className="space-y-8">
          <Acoes />
          <Exibicao />
          <Retorno />
        </div>
      </Secao>
    </main>
  )
}

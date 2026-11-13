import type { Metadata } from 'next'
import { CabecalhoPagina } from '@/components/elo/cabecalho-pagina'
import { Acoes } from './_secoes/acoes'
import { EstadosDeInterface } from './_secoes/estados'
import { Estrutura } from './_secoes/estrutura'
import { Exibicao } from './_secoes/exibicao'
import { Formulario } from './_secoes/formulario'
import { Fundamentos } from './_secoes/fundamentos'
import { Marca } from './_secoes/marca'
import { Navegacao } from './_secoes/navegacao'
import { Retorno } from './_secoes/retorno'
import { Secao } from './_secoes/secao'
import { Tabela } from './_secoes/tabela'
import { Tipografia } from './_secoes/tipografia'

// O layout raiz não usa modelo de título: o sufixo vai completo aqui.
export const metadata: Metadata = { title: 'Padrão visual | Plataforma ELO' }

export default function PaginaDesignSystem() {
  return (
    <div className="w-full max-w-6xl">
      <CabecalhoPagina
        titulo="Padrão visual"
        contexto="Cores, tipografia e componentes da Plataforma ELO, com dados fictícios."
      />

      <Marca />
      <Tipografia />
      <Fundamentos />
      <Secao
        titulo="Componentes"
        descricao="Cada componente com as suas variações e estados, lado a lado."
      >
        <div className="space-y-8">
          <Acoes />
          <Formulario />
          <Exibicao />
          <Tabela />
          <Navegacao />
          <Retorno />
        </div>
      </Secao>
      <EstadosDeInterface />
      <Estrutura />
    </div>
  )
}

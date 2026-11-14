import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { EntradaHistorico } from '@/lib/dados/tipos'
import { LinhaAutoria, PainelHistorico } from './painel-historico'

const criacao: EntradaHistorico = {
  id: 'h1',
  dataHora: '2026-02-02T09:15:00-03:00',
  usuario: 'Helena Prado',
  descricao: 'Cadastro criado',
}
const status: EntradaHistorico = {
  id: 'h2',
  dataHora: '2026-03-12T16:40:00-03:00',
  usuario: 'Helena Prado',
  descricao: 'Status do cliente',
  valorAnterior: 'Prospect',
  valorNovo: 'Ativo',
}
const telefone: EntradaHistorico = {
  id: 'h3',
  dataHora: '2026-09-20T14:32:00-03:00',
  usuario: 'Rafael Souza',
  descricao: 'Telefone',
  valorNovo: '(22) 2765-4310',
}

describe('PainelHistorico (F17, CA-17.3)', () => {
  it('é um painel com o título Histórico', () => {
    render(<PainelHistorico entradas={[criacao]} />)
    expect(screen.getByRole('heading', { name: 'Histórico' })).toBeInTheDocument()
  })

  it('lista da alteração mais recente para a mais antiga, mesmo fora de ordem', () => {
    render(<PainelHistorico entradas={[status, criacao, telefone]} />)
    const itens = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(itens.map((i) => i.querySelector('[data-slot="descricao"]')?.textContent)).toEqual([
      'Telefone',
      'Status do cliente',
      'Cadastro criado',
    ])
  })

  it('mostra o valor anterior e o novo, ou só o novo', () => {
    render(<PainelHistorico entradas={[status, telefone]} />)
    expect(screen.getByText('De Prospect para Ativo')).toBeInTheDocument()
    expect(screen.getByText('(22) 2765-4310')).toBeInTheDocument()
  })

  it('mostra a data e a hora em fonte de número, e o usuário', () => {
    render(<PainelHistorico entradas={[telefone]} />)
    const data = screen.getByText('20/09/2026 14:32')
    expect(data).toHaveClass('font-mono')
    expect(screen.getByRole('listitem')).toHaveTextContent('Rafael Souza')
  })

  it('sem entradas, diz que não há alteração', () => {
    render(<PainelHistorico entradas={[]} />)
    expect(screen.getByText('Nenhuma alteração registrada.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})

describe('LinhaAutoria (CA-17.1)', () => {
  it('diz quem criou e quem alterou por último, com as datas', () => {
    const { container } = render(<LinhaAutoria entradas={[telefone, criacao, status]} />)
    expect(container).toHaveTextContent(
      'Criado por Helena Prado em 02/02/2026 · Última alteração por Rafael Souza em 20/09/2026',
    )
  })

  it('com uma só entrada, diz só quem criou', () => {
    const { container } = render(<LinhaAutoria entradas={[criacao]} />)
    expect(container).toHaveTextContent(/^Criado por Helena Prado em 02\/02\/2026$/)
  })

  it('sem entradas, não mostra nada', () => {
    const { container } = render(<LinhaAutoria entradas={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

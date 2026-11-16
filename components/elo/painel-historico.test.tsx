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
    expect(screen.getByRole('list')).toHaveTextContent('(22) 2765-4310')
  })

  it('mostra a data e a hora em fonte de número, e o usuário', () => {
    render(<PainelHistorico entradas={[telefone]} />)
    const data = screen.getByText('20/09/2026 14:32')
    expect(data).toHaveClass('font-mono')
    expect(screen.getByRole('listitem')).toHaveTextContent('Rafael Souza')
  })

  it('mostra a justificativa abaixo da mudança, quando a entrada tem uma (RN-22, CA-05.2)', () => {
    const criticidade: EntradaHistorico = {
      id: 'h4',
      dataHora: '2026-10-02T10:00:00-03:00',
      usuario: 'Helena Prado',
      descricao: 'Criticidade',
      valorAnterior: 'Moderada',
      valorNovo: 'Alta',
      justificativa: 'Certidões vencendo antes da medição.',
    }
    render(<PainelHistorico entradas={[criticidade, status]} />)
    const [comJustificativa, semJustificativa] = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(within(comJustificativa).getByText('Justificativa: Certidões vencendo antes da medição.')).toBeInTheDocument()
    expect(semJustificativa).not.toHaveTextContent('Justificativa')
  })

  it('as datas e os códigos da mudança ficam em fonte de número (padrão visual)', () => {
    const movido: EntradaHistorico = {
      id: 'h5',
      dataHora: '2026-03-02T09:00:00-03:00',
      usuario: 'Helena Prado',
      descricao: 'Contrato',
      valorAnterior: 'CT-2025-031',
      valorNovo: 'CT-2026-044',
    }
    render(<PainelHistorico entradas={[movido]} />)
    expect(screen.getByRole('listitem')).toHaveTextContent('De CT-2025-031 para CT-2026-044')
    expect(screen.getByText('CT-2025-031')).toHaveClass('font-mono')
    expect(screen.getByText('CT-2026-044')).toHaveClass('font-mono')
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

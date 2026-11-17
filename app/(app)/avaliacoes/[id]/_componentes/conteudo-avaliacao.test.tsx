import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { metadata } from '../page'
import { ConteudoAvaliacao } from './conteudo-avaliacao'

vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

beforeEach(() => limparCookies())

const conteudo = (id: string) => ConteudoAvaliacao({ params: Promise.resolve({ id }) })

async function abrir(id: string) {
  return render(await conteudo(id))
}

const botao = (nome: string) => screen.queryByRole('button', { name: nome })

const linhaDa = (dimensao: string) => screen.getByRole('cell', { name: dimensao }).closest('tr')!

describe('página da avaliação (parte 2, 5.9)', () => {
  it('tem o título da aba', () => {
    expect(metadata.title).toBe('Avaliação de maturidade | Plataforma ELO')
  })

  it('o cabeçalho tem a volta para a aba Maturidade, o cliente com link, a data e o status', async () => {
    entrarComo('usr-helena')
    const { container } = await abrir('ava-vertice-3')
    expect(screen.getByRole('link', { name: 'Voltar para Vértice Manutenção' })).toHaveAttribute(
      'href',
      '/clientes/cli-vertice?aba=maturidade',
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Avaliação de maturidade' })).toBeInTheDocument()
    const cabecalho = within(container.querySelector('header')!)
    expect(cabecalho.getByRole('link', { name: 'Vértice Manutenção' })).toHaveAttribute('href', '/clientes/cli-vertice')
    expect(cabecalho.getByText('05/11/2026')).toBeInTheDocument()
    expect(cabecalho.getByText('Em elaboração')).toBeInTheDocument()
  })

  it('a Helena vê Editar e Concluir na Em elaboração, sem Reabrir', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-3')
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/avaliacoes/ava-vertice-3/editar')
    expect(botao('Concluir')).toBeInTheDocument()
    expect(botao('Reabrir')).not.toBeInTheDocument()
  })

  it('a Helena vê só Reabrir na Concluída (critério 18)', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    expect(botao('Reabrir')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(botao('Concluir')).not.toBeInTheDocument()
  })

  it('o contrato de referência aparece com link, contratante e serviços (F20, CA-20.3)', async () => {
    entrarComo('usr-helena')
    await abrir('ava-atlantica-1')
    const resultado = within(screen.getByRole('region', { name: 'Resultado' }))
    expect(resultado.getByRole('link', { name: 'CT-2024-008' })).toHaveAttribute('href', '/contratos/ctr-atlantica-porto')
    const campo = resultado.getByText('Contrato de referência').closest('div')!
    expect(campo).toHaveTextContent('Porto do Açu')
    expect(campo).toHaveTextContent('Serviços Portuários e Marítimos, Movimentação de Cargas')
  })

  it('os painéis aparecem na ordem da especificação', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Resultado',
      'Níveis por dimensão',
      'Parecer',
      'Observações internas',
      'Planos de desenvolvimento',
      'Documentos',
      'Histórico',
    ])
  })

  it('o Resultado e o Parecer mostram o que o avaliador informou', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    const resultado = within(screen.getByRole('region', { name: 'Resultado' }))
    expect(resultado.getByText('Em estruturação')).toBeInTheDocument()
    expect(resultado.getByText('Pronto com condições')).toBeInTheDocument()
    expect(resultado.getByText('Rafael Souza')).toBeInTheDocument()
    expect(resultado.getByText('15/09/2026')).toBeInTheDocument()
    expect(resultado.getByText('Sem contrato de referência')).toBeInTheDocument()
    const parecer = within(screen.getByRole('region', { name: 'Parecer' }))
    expect(parecer.getByText('Pontos fortes')).toBeInTheDocument()
    expect(parecer.getByText('Lacunas prioritárias')).toBeInTheDocument()
    expect(parecer.getByText('Recomendação ELO')).toBeInTheDocument()
    expect(parecer.getByText(/^Apto a cadastros com condições/)).toBeInTheDocument()
  })

  it('a tabela de níveis tem as colunas da especificação; a média vazia é o traço e 2,5 vira 2,50', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    const niveis = within(screen.getByRole('region', { name: 'Níveis por dimensão' }))
    expect(niveis.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Dimensão',
      'Nível',
      'Média',
      'Principal lacuna',
    ])
    expect(niveis.getAllByRole('row')).toHaveLength(9)
    expect(within(linhaDa('Gestão e qualidade')).getByText('2,50')).toBeInTheDocument()
    expect(within(linhaDa('Sustentação financeira')).getByText('—')).toBeInTheDocument()
  })

  it('os planos ligados à avaliação, com o resumo das atividades (CA-20.7, DF-80)', async () => {
    entrarComo('usr-rafael')
    await abrir('ava-vertice-2')
    const planos = within(screen.getByRole('region', { name: 'Planos de desenvolvimento' }))
    expect(planos.getAllByRole('columnheader').map((c) => c.textContent)).toEqual(['Plano', 'Escopo', 'Status', 'Atividades'])
    const linha = planos.getByText('Plano de desenvolvimento da gestão').closest('tr')!
    expect(linha).toHaveTextContent('Diagnóstico para nova proposta')
    expect(linha).toHaveTextContent('0 de 2 concluídas')
  })

  it('as observações internas trazem a nota de uso interno; documentos, o estado vazio', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    const observacoes = within(screen.getByRole('region', { name: 'Observações internas' }))
    expect(observacoes.getByText('Uso interno. Não sai na Visão Executiva nem no PDF.')).toBeInTheDocument()
    expect(observacoes.getByText(/^Evolução clara desde março/)).toBeInTheDocument()
    expect(screen.getByText('Nenhum documento ligado a esta avaliação.')).toBeInTheDocument()
  })

  it('avaliação sem plano ligado mostra o vazio', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-1')
    expect(screen.getByText('Nenhum plano ligado a esta avaliação.')).toBeInTheDocument()
  })

  it('o histórico mostra o valor anterior e o novo, e a página mostra quem criou e quem alterou (critério 20)', async () => {
    entrarComo('usr-helena')
    await abrir('ava-vertice-2')
    const historico = within(screen.getByRole('region', { name: 'Histórico' }))
    expect(historico.getByText('De Helena Prado para Rafael Souza')).toBeInTheDocument()
    expect(
      screen.getByText((_, el) =>
        el?.tagName === 'P' &&
        el.textContent === 'Criado por Helena Prado em 10/09/2026 · Última alteração por Helena Prado em 18/09/2026',
      ),
    ).toBeInTheDocument()
  })

  it('o Rafael edita a avaliação Em elaboração, mas não vê Concluir nem Reabrir (critério 17)', async () => {
    entrarComo('usr-rafael')
    await abrir('ava-vertice-3')
    expect(screen.getByRole('link', { name: 'Editar' })).toBeInTheDocument()
    expect(botao('Concluir')).not.toBeInTheDocument()
    expect(botao('Reabrir')).not.toBeInTheDocument()
  })

  it('o Rafael não vê ação nenhuma na Concluída', async () => {
    entrarComo('usr-rafael')
    await abrir('ava-vertice-2')
    expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument()
    expect(botao('Reabrir')).not.toBeInTheDocument()
  })

  it('fora do vínculo ou com id que não existe, não encontrado (critério 19)', async () => {
    entrarComo('usr-rafael')
    await expect(conteudo('ava-montareal-1')).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(conteudo('ava-nao-existe')).rejects.toThrow('NEXT_NOT_FOUND')
  })
})

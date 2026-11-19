import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listarEscopos } from '@/lib/dados/escopos'
import type { EscopoDetalhado } from '@/lib/dados/tipos'
import type { FiltrosEscopos } from '@/lib/escopos/filtros'
import { entrarComo, limparCookies } from '@/lib/testes/next-falso'
import { ListaEscopos } from './lista-escopos'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/headers', async () => (await import('@/lib/testes/next-falso')).moduloHeaders)
vi.mock('next/navigation', async () => ({
  ...(await import('@/lib/testes/next-falso')).moduloNavigation,
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

const SEM_FILTRO: FiltrosEscopos = {
  busca: '',
  cliente: null,
  contrato: null,
  responsavel: null,
  status: [],
  criticidade: [],
  prioridade: [],
  etapa: [],
}

const CLIENTES = [
  { valor: 'cli-montareal', rotulo: 'Montareal' },
  { valor: 'cli-vertice', rotulo: 'Vértice Manutenção' },
]

let ESCOPOS: EscopoDetalhado[] = []

function montar(props: Partial<Parameters<typeof ListaEscopos>[0]> = {}) {
  return render(
    <ListaEscopos escopos={ESCOPOS} clientes={CLIENTES} filtrosIniciais={SEM_FILTRO} semVinculo={false} {...props} />,
  )
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

beforeEach(async () => {
  limparCookies()
  entrarComo('usr-helena')
  ESCOPOS = await listarEscopos()
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/escopos')
})

afterEach(() => vi.restoreAllMocks())

describe('ListaEscopos', () => {
  it('a linha abre o escopo', async () => {
    montar()
    await userEvent.click(screen.getByText('Mobilização de equipe'))
    expect(push).toHaveBeenCalledWith('/escopos/esc-vertice-mobilizacao')
  })

  it('a busca filtra na hora e a contagem acompanha', async () => {
    const { container } = montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'ct-2026-044')
    expect(linhas()).toHaveLength(1)
    expect(container.querySelector('header')).toHaveTextContent('1 escopo')
  })

  it('sem resultado, avisa e deixa limpar os filtros', async () => {
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Nenhum escopo com esses filtros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(linhas()).toHaveLength(10)
  })

  it('sem nenhum escopo, diz que não há escopo cadastrado, sem limpar filtros', () => {
    montar({ escopos: [] })
    expect(screen.getByText('Nenhum escopo cadastrado.')).toBeInTheDocument()
    expect(screen.queryByText('Nenhum escopo com esses filtros.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
  })

  it('a Equipe sem vínculo vê o aviso de falar com o Administrador', () => {
    montar({ escopos: [], clientes: [], semVinculo: true })
    expect(screen.getByText('Você ainda não tem clientes vinculados.')).toBeInTheDocument()
    expect(screen.getByText('Fale com o Administrador da ELO.')).toBeInTheDocument()
  })

  it('sem cliente escolhido, o código repetido do contrato vem com o nome do cliente', async () => {
    montar()
    await userEvent.click(screen.getByRole('combobox', { name: 'Contrato' }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes).toContain('CT-2025-031 · Montareal')
    expect(opcoes).toContain('CT-2025-031 · Vértice Manutenção')
  })

  it('trocar o cliente limpa o contrato que não é dele', async () => {
    const trocar = vi.spyOn(window.history, 'replaceState')
    montar({ filtrosIniciais: { ...SEM_FILTRO, contrato: 'ctr-montareal-montagem' } })
    expect(linhas()).toHaveLength(1)
    await userEvent.click(screen.getByRole('combobox', { name: 'Cliente' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Vértice Manutenção' }))
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/escopos?cliente=cli-vertice')
    expect(linhas()).toHaveLength(4)
  })

  it('o filtro Etapa atual mostra só os escopos nessa etapa da Jornada (CA-06.4)', () => {
    montar({ filtrosIniciais: { ...SEM_FILTRO, etapa: ['Implementar'] } })
    const esperados = ESCOPOS.filter((e) => e.etapaAtual === 'Implementar')
    expect(esperados.length).toBeGreaterThan(0)
    expect(linhas()).toHaveLength(esperados.length)
    expect(screen.getByRole('combobox', { name: 'Etapa atual' })).toBeInTheDocument()
  })

  it('em tela até 1536 px, a Prioridade some para o Responsável caber (revisão do Jonathan)', () => {
    montar()
    const prioridade = screen.getByRole('columnheader', { name: /Prioridade/ })
    expect(prioridade.className.split(' ')).toEqual(expect.arrayContaining(['hidden', '2xl:table-cell']))
    expect(screen.getByRole('columnheader', { name: /Responsável/ }).className.split(' ')).not.toContain('hidden')
  })

  it('o filtro Responsável oferece quem responde pelos escopos', async () => {
    montar()
    await userEvent.click(screen.getByRole('combobox', { name: 'Responsável' }))
    const opcoes = (await screen.findAllByRole('option')).map((o) => o.textContent)
    expect(opcoes).toEqual(['Todos os responsáveis', 'Helena Prado', 'Rafael Souza'])
  })
})

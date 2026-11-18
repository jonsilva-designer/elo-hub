import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DA_LISTA } from '@/lib/clientes/filtros'
import type { Cliente } from '@/lib/dados/tipos'
import { ListaClientes } from './lista-clientes'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))

const cliente = (id: string, nomeFantasia: string, status: Cliente['status'] = 'Ativo'): Cliente => ({
  id,
  razaoSocial: `${nomeFantasia} Ltda`,
  nomeFantasia,
  cnpj: '21.473.509/0001-21',
  status,
  ehCadastroElo: false,
})

const CLIENTES = [cliente('cli-vertice', 'Vértice Manutenção'), cliente('cli-atlantica', 'Atlântica Portos'), cliente('cli-limpar', 'Limpar', 'Prospect')]
const SEM_FILTRO = { busca: '', status: [], segmento: null }

function montar(props: Partial<Parameters<typeof ListaClientes>[0]> = {}) {
  return render(
    <ListaClientes clientes={CLIENTES} segmentos={['Tecnologia']} filtrosIniciais={SEM_FILTRO} ehAdmin {...props} />,
  )
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

beforeEach(() => {
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/clientes')
})

afterEach(() => vi.restoreAllMocks())

describe('ListaClientes', () => {
  it('a busca filtra na hora, vai para o endereço e fica guardada para a volta', async () => {
    const trocar = vi.spyOn(window.history, 'replaceState')
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'vert')
    expect(linhas()).toHaveLength(1)
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/clientes?busca=vert')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DA_LISTA)).toBe('busca=vert')
  })

  it('continua funcionando sem o armazenamento do navegador', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'atl')
    expect(linhas()).toHaveLength(1)
  })

  it('sem resultado, avisa e deixa limpar os filtros', async () => {
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Nenhum cliente com esses filtros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(linhas()).toHaveLength(3)
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('')
  })

  it('conta os clientes mostrados no cabeçalho, no singular e no plural', async () => {
    const { container } = montar()
    expect(container.querySelector('header')).toHaveTextContent('3 clientes')
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'limp')
    expect(container.querySelector('header')).toHaveTextContent('1 cliente')
  })

  it('a Equipe sem vínculo vê o aviso para falar com o Administrador', () => {
    montar({ clientes: [], ehAdmin: false })
    expect(screen.getByText('Você ainda não tem clientes vinculados.')).toBeInTheDocument()
    expect(screen.getByText('Fale com o Administrador da ELO.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument()
  })

  it('clicar na linha abre a página do cliente', async () => {
    montar()
    await userEvent.click(within(linhas()[2]).getByText('Vértice Manutenção'))
    expect(push).toHaveBeenCalledWith('/clientes/cli-vertice')
  })

  it('Exportar baixa o CSV com os filtros da tela', async () => {
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'vert')
    await userEvent.click(screen.getByRole('button', { name: /Exportar/ }))
    expect(clicar).toHaveBeenCalledTimes(1)
    expect(clicar.mock.contexts[0]).toHaveAttribute('href', '/api/exportar/clientes?busca=vert')
  })

  it('a Equipe não vê Exportar nem Novo cliente', () => {
    montar({ ehAdmin: false })
    expect(screen.queryByRole('button', { name: /Exportar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Novo cliente/ })).not.toBeInTheDocument()
  })

  it('as colunas têm largura fixa: a busca não muda o tamanho delas', async () => {
    montar()
    const larguras = () => screen.getAllByRole('columnheader').map((th) => th.className.match(/w-\d+\/\d+/)?.[0])
    const antes = larguras()
    expect(screen.getByRole('table')).toHaveClass('table-fixed')
    expect(antes.filter(Boolean).length).toBeGreaterThanOrEqual(4)
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'atl')
    expect(larguras()).toEqual(antes)
  })

  it('vindo do painel, só a carteira: sem o cadastro da ELO, e o filtro aparece e sai (CA-13.4)', async () => {
    const elo = { ...cliente('cli-elo', 'ELO HUB'), ehCadastroElo: true }
    montar({ clientes: [elo, ...CLIENTES], filtrosIniciais: { busca: '', status: ['Ativo'], segmento: null, carteira: true } })
    expect(screen.queryByText('ELO HUB')).not.toBeInTheDocument()
    const cadastros = screen.getByRole('combobox', { name: 'Cadastros' })
    expect(cadastros).toHaveTextContent('Só a carteira')
    await userEvent.click(cadastros)
    await userEvent.click(await screen.findByRole('option', { name: 'Com o cadastro da ELO' }))
    expect(screen.getByText('ELO HUB')).toBeInTheDocument()
  })

  it('começa com os filtros vindos do endereço', () => {
    montar({ filtrosIniciais: { busca: 'atl', status: [], segmento: null } })
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toHaveValue('atl')
    expect(linhas()).toHaveLength(1)
  })
})

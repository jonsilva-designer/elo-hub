import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_FILTROS_DOS_CONTRATOS, type FiltrosContratos } from '@/lib/contratos/filtros'
import type { ContratoDetalhado } from '@/lib/dados/tipos'
import { ListaContratos } from './lista-contratos'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))

const contrato = (id: string, codigo: string, status: ContratoDetalhado['status']): ContratoDetalhado => ({
  id,
  clienteId: 'cli-vertice',
  codigo,
  contratante: 'Petrobras',
  objeto: `Objeto de ${codigo}`,
  servicos: ['Engenharia'],
  dataProposta: null,
  tipoVigencia: 'Prazo determinado',
  inicio: '2026-01-01',
  termino: '2027-06-30',
  valor: null,
  responsavelId: 'usr-helena',
  status,
  observacoes: '',
  nomeCliente: 'Vértice Manutenção',
  nomeResponsavel: 'Helena Prado',
  vigencia: status === 'Encerrado' ? { status: 'Encerrado', diasRestantes: null } : { status: 'Vigente', diasRestantes: 228 },
})

const CONTRATOS = [contrato('ctr-a', 'CT-001', 'Ativo'), contrato('ctr-b', 'CT-002', 'Encerrado')]
const SEM_FILTRO: FiltrosContratos = { busca: '', cliente: null, contratante: null, servico: null, status: [], vigencia: [] }

function montar(props: Partial<Parameters<typeof ListaContratos>[0]> = {}) {
  return render(
    <ListaContratos
      contratos={CONTRATOS}
      clientes={[{ valor: 'cli-vertice', rotulo: 'Vértice Manutenção' }]}
      contratantes={['Petrobras']}
      servicos={['Engenharia']}
      filtrosIniciais={SEM_FILTRO}
      ehAdmin
      {...props}
    />,
  )
}

const linhas = () => within(screen.getAllByRole('rowgroup')[1]).getAllByRole('row')

beforeEach(() => {
  push.mockReset()
  sessionStorage.clear()
  window.history.replaceState(null, '', '/contratos')
})

afterEach(() => vi.restoreAllMocks())

describe('ListaContratos', () => {
  it('a busca filtra na hora, vai para o endereço e fica guardada para a volta (CA-16.2)', async () => {
    const trocar = vi.spyOn(window.history, 'replaceState')
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'ct-002')
    expect(linhas()).toHaveLength(1)
    expect(trocar).toHaveBeenLastCalledWith(null, '', '/contratos?busca=ct-002')
    expect(sessionStorage.getItem(CHAVE_FILTROS_DOS_CONTRATOS)).toBe('busca=ct-002')
  })

  it('a linha abre o contrato', async () => {
    montar()
    await userEvent.click(screen.getByText('CT-001'))
    expect(push).toHaveBeenCalledWith('/contratos/ctr-a')
  })

  it('sem resultado, avisa e deixa limpar os filtros', async () => {
    montar()
    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar' }), 'zzz')
    expect(screen.getByText('Nenhum contrato com esses filtros.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(linhas()).toHaveLength(2)
  })

  it('a Equipe sem vínculo vê o aviso de falar com o Administrador', () => {
    montar({ contratos: [], clientes: [], ehAdmin: false })
    expect(screen.getByText('Você ainda não tem clientes vinculados.')).toBeInTheDocument()
    expect(screen.getByText('Fale com o Administrador da ELO.')).toBeInTheDocument()
  })

  it('Exportar baixa a rota com os filtros do endereço', async () => {
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    montar({ filtrosIniciais: { ...SEM_FILTRO, status: ['Ativo'] } })
    await userEvent.click(screen.getByRole('button', { name: /Exportar/ }))
    expect(clicar).toHaveBeenCalled()
    const link = clicar.mock.instances[0] as unknown as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/api/exportar/contratos?status=Ativo')
  })
})

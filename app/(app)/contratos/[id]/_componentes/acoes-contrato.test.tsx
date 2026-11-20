import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { cancelarContrato, encerrarContrato, excluirContrato, reabrirContrato } from '@/lib/contratos/acoes'
import type { ContratoDetalhado, ItemQueImpede, StatusContrato } from '@/lib/dados/tipos'
import { AcoesContrato } from './acoes-contrato'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/contratos/acoes', () => ({
  encerrarContrato: vi.fn(),
  cancelarContrato: vi.fn(),
  reabrirContrato: vi.fn(),
  excluirContrato: vi.fn(),
}))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const contrato = (status: StatusContrato): ContratoDetalhado => ({
  id: 'ctr-x',
  clienteId: 'cli-vertice',
  codigo: 'CT-2026-001',
  contratante: 'Petrobras',
  objeto: 'Manutenção',
  servicos: ['Manutenção Industrial'],
  dataProposta: null,
  tipoVigencia: 'Prazo determinado',
  inicio: '2026-01-01',
  termino: '2027-12-31',
  valor: null,
  responsavelId: 'usr-helena',
  status,
  observacoes: '',
  nomeCliente: 'Vértice Manutenção',
  nomeResponsavel: 'Helena Prado',
  vigencia: null,
})

const ESCOPO_ABERTO: ItemQueImpede = {
  tipo: 'Escopo',
  descricao: 'Regularização documental',
  status: 'Em andamento',
  responsavel: 'Rafael Souza',
  href: '/escopos/esc-vertice-documental',
}

const SUCESSO = { ok: true, mensagem: 'Feito. No protótipo, os dados não são gravados.' }

beforeEach(() => {
  push.mockReset()
  for (const f of [encerrarContrato, cancelarContrato, reabrirContrato, excluirContrato]) vi.mocked(f).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(status: StatusContrato, impedimentos: ItemQueImpede[] = [], podeExcluir = false) {
  return render(
    <TooltipProvider>
      <AcoesContrato contrato={contrato(status)} impedimentos={impedimentos} podeExcluir={podeExcluir} />
    </TooltipProvider>,
  )
}

async function abrirMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
  return screen.findByRole('menu')
}

async function escolher(item: string) {
  await abrirMenu()
  await userEvent.click(await screen.findByRole('menuitem', { name: item }))
}

describe('AcoesContrato (parte 3, 5.6)', () => {
  it('o contrato Ativo tem Encerrar, sem Cancelar, Reabrir nem Excluir', async () => {
    montar('Ativo')
    const menu = within(await abrirMenu())
    expect(menu.getByRole('menuitem', { name: 'Encerrar' })).toBeInTheDocument()
    expect(menu.queryByRole('menuitem', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(menu.queryByRole('menuitem', { name: 'Reabrir' })).not.toBeInTheDocument()
    expect(menu.queryByRole('menuitem', { name: 'Excluir' })).not.toBeInTheDocument()
  })

  it('a proposta tem Cancelar; o encerrado tem Reabrir; sem nada ligado, Excluir', async () => {
    const { unmount } = montar('Proposta', [], true)
    let menu = within(await abrirMenu())
    expect(menu.getByRole('menuitem', { name: 'Cancelar' })).toBeInTheDocument()
    expect(menu.getByRole('menuitem', { name: 'Excluir' })).toBeInTheDocument()
    expect(menu.queryByRole('menuitem', { name: 'Encerrar' })).not.toBeInTheDocument()
    unmount()
    montar('Encerrado')
    menu = within(await abrirMenu())
    expect(menu.getByRole('menuitem', { name: 'Reabrir' })).toBeInTheDocument()
    expect(menu.queryByRole('menuitem', { name: 'Encerrar' })).not.toBeInTheDocument()
  })

  it('com escopos abertos, Encerrar abre a janela bloqueada com o link do escopo e só Fechar (CA-18.3)', async () => {
    montar('Ativo', [ESCOPO_ABERTO])
    await escolher('Encerrar')
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Não é possível encerrar' })).toBeInTheDocument()
    expect(janela.getByText('Não é possível encerrar este contrato enquanto houver escopos ou demandas abertos.')).toBeInTheDocument()
    expect(janela.getByRole('link', { name: /Regularização documental/ })).toHaveAttribute('href', '/escopos/esc-vertice-documental')
    expect(janela.getAllByRole('button').map((b) => b.textContent)).toEqual(['Fechar'])
  })

  it('sem impedimentos, Encerrar confirma e chama o servidor', async () => {
    vi.mocked(encerrarContrato).mockResolvedValue(SUCESSO)
    montar('Suspenso')
    await escolher('Encerrar')
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Encerrar contrato?' })).toBeInTheDocument()
    expect(janela.getByText('O contrato vigorou e terminou. Ele sai dos alertas de vencimento.')).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Encerrar' }))
    await waitFor(() => expect(avisarSalvo).toHaveBeenCalledWith(SUCESSO.mensagem))
    expect(encerrarContrato).toHaveBeenCalledWith('ctr-x')
  })

  it('Cancelar confirma com o botão "Cancelar contrato"', async () => {
    vi.mocked(cancelarContrato).mockResolvedValue(SUCESSO)
    montar('Em contratação')
    await escolher('Cancelar')
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Cancelar contrato?' })).toBeInTheDocument()
    expect(janela.getByText('O contrato ou a proposta não chegou a vigorar.')).toBeInTheDocument()
    await userEvent.click(janela.getByRole('button', { name: 'Cancelar contrato' }))
    await waitFor(() => expect(cancelarContrato).toHaveBeenCalledWith('ctr-x'))
  })

  it('Reabrir sem justificativa mostra o erro sem chamar o servidor', async () => {
    montar('Cancelado')
    await escolher('Reabrir')
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Reabrir contrato?' })).toBeInTheDocument()
    expect(janela.getByRole('radio', { name: 'Proposta' })).toBeChecked()
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(await janela.findByText('Escreva a justificativa da reabertura.')).toBeInTheDocument()
    expect(reabrirContrato).not.toHaveBeenCalled()
  })

  it('Reabrir com justificativa chama o servidor com o status escolhido', async () => {
    vi.mocked(reabrirContrato).mockResolvedValue(SUCESSO)
    montar('Cancelado')
    await escolher('Reabrir')
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Motivo')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    await waitFor(() => expect(reabrirContrato).toHaveBeenCalledWith('ctr-x', 'Proposta', 'Motivo'))
  })

  it('a recusa do servidor aparece dentro da janela', async () => {
    vi.mocked(reabrirContrato).mockResolvedValue({ ok: false, mensagem: 'Para voltar como Ativo ou Suspenso, o contrato precisa das datas da vigência. Edite o contrato antes.' })
    montar('Cancelado')
    await escolher('Reabrir')
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.click(janela.getByRole('radio', { name: 'Ativo' }))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Retomada')
    await userEvent.click(janela.getByRole('button', { name: 'Reabrir' }))
    expect(await janela.findByText(/precisa das datas da vigência/)).toBeInTheDocument()
    expect(reabrirContrato).toHaveBeenCalledWith('ctr-x', 'Ativo', 'Retomada')
  })

  it('Excluir volta para a lista com os filtros que estavam aplicados (revisão do código)', async () => {
    sessionStorage.setItem('elo:filtros-contratos', 'status=Cancelado')
    vi.mocked(excluirContrato).mockResolvedValue(SUCESSO)
    montar('Proposta', [], true)
    await escolher('Excluir')
    const janela = within(await screen.findByRole('alertdialog'))
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Duplicado')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/contratos?status=Cancelado'))
    sessionStorage.clear()
  })

  it('Excluir com sucesso volta para a lista de contratos', async () => {
    vi.mocked(excluirContrato).mockResolvedValue(SUCESSO)
    montar('Proposta', [], true)
    await escolher('Excluir')
    const janela = within(await screen.findByRole('alertdialog'))
    expect(janela.getByRole('heading', { name: 'Excluir contrato?' })).toBeInTheDocument()
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Duplicado')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/contratos'))
    expect(excluirContrato).toHaveBeenCalledWith('ctr-x', 'Duplicado')
  })
})

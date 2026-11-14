import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { excluirCliente, inativarCliente, reativarCliente } from '@/lib/clientes/acoes'
import type { Cliente, ItemQueImpede } from '@/lib/dados/tipos'
import { AcoesCliente } from './acoes-cliente'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/clientes/acoes', () => ({ inativarCliente: vi.fn(), reativarCliente: vi.fn(), excluirCliente: vi.fn() }))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const cliente = (id: string, status: Cliente['status']): Cliente => ({
  id,
  razaoSocial: `${id} Ltda`,
  cnpj: '21.473.509/0001-21',
  status,
  ehCadastroElo: false,
})

const IMPEDIMENTO: ItemQueImpede = {
  tipo: 'Avaliação de maturidade',
  descricao: 'Avaliação de 05/11/2026',
  status: 'Em elaboração',
  responsavel: 'Rafael Souza',
  href: '/avaliacoes/ava-vertice-3',
}

beforeEach(() => {
  push.mockReset()
  vi.mocked(inativarCliente).mockReset()
  vi.mocked(reativarCliente).mockReset()
  vi.mocked(excluirCliente).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

function montar(c: Cliente, impedimentos: ItemQueImpede[] = [], podeExcluir = false) {
  render(
    <TooltipProvider>
      <AcoesCliente cliente={c} impedimentos={impedimentos} podeExcluir={podeExcluir} />
    </TooltipProvider>,
  )
}

async function escolher(item: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
  await userEvent.click(await screen.findByRole('menuitem', { name: item }))
}

describe('AcoesCliente (parte 2, 5.7)', () => {
  it('com itens abertos, Inativar abre a janela bloqueada com o link do item, sem Excluir no menu', async () => {
    montar(cliente('cli-vertice', 'Ativo'), [IMPEDIMENTO], false)
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(await screen.findByRole('menuitem', { name: 'Inativar' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Excluir' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Inativar' }))
    const janela = await screen.findByRole('alertdialog')
    expect(janela).toHaveTextContent('Não é possível inativar este cliente enquanto houver itens abertos ligados a ele.')
    expect(within(janela).getByRole('link', { name: 'Avaliação de 05/11/2026' })).toHaveAttribute(
      'href',
      '/avaliacoes/ava-vertice-3',
    )
    expect(within(janela).queryByRole('button', { name: 'Inativar' })).not.toBeInTheDocument()
    expect(within(janela).getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })

  it('sem itens abertos, inativar confirma, avisa e fecha a janela', async () => {
    vi.mocked(inativarCliente).mockResolvedValue({ ok: true, mensagem: 'Cliente inativado. No protótipo, os dados não são gravados.' })
    montar(cliente('cli-atlantica', 'Ativo'))
    await escolher('Inativar')
    const janela = await screen.findByRole('alertdialog')
    expect(janela).toHaveTextContent('Inativar cliente?')
    await userEvent.click(within(janela).getByRole('button', { name: 'Inativar' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(inativarCliente).toHaveBeenCalledWith('cli-atlantica')
    expect(avisarSalvo).toHaveBeenCalledWith('Cliente inativado. No protótipo, os dados não são gravados.')
    expect(push).not.toHaveBeenCalled()
  })

  it('no cliente Inativo, o menu tem Reativar, e a janela pede o status de destino, começando em Ativo', async () => {
    vi.mocked(reativarCliente).mockResolvedValue({ ok: true, mensagem: 'Cliente reativado. No protótipo, os dados não são gravados.' })
    montar(cliente('cli-fortec', 'Inativo'), [], true)
    await escolher('Reativar')
    const janela = await screen.findByRole('alertdialog')
    expect(within(janela).getByRole('radio', { name: 'Ativo' })).toBeChecked()
    await userEvent.click(within(janela).getByRole('radio', { name: 'Prospect' }))
    await userEvent.click(within(janela).getByRole('button', { name: 'Reativar' }))
    await waitFor(() => expect(reativarCliente).toHaveBeenCalledWith('cli-fortec', 'Prospect'))
  })

  it('excluir sem justificativa avisa e mantém a janela aberta; com ela, exclui e volta à lista', async () => {
    vi.mocked(excluirCliente).mockResolvedValue({ ok: true, mensagem: 'Cliente excluído. No protótipo, os dados não são gravados.' })
    montar(cliente('cli-limpar', 'Prospect'), [], true)
    await escolher('Excluir')
    const janela = await screen.findByRole('alertdialog')
    expect(janela).toHaveTextContent('A exclusão é definitiva. Escreva o motivo.')
    await userEvent.click(within(janela).getByRole('button', { name: 'Excluir' }))
    expect(await within(janela).findByText('Escreva a justificativa da exclusão.')).toBeInTheDocument()
    expect(excluirCliente).not.toHaveBeenCalled()
    await userEvent.type(within(janela).getByRole('textbox', { name: /Justificativa/ }), 'Cadastro duplicado')
    await userEvent.click(within(janela).getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/clientes'))
    expect(excluirCliente).toHaveBeenCalledWith('cli-limpar', 'Cadastro duplicado')
    expect(avisarSalvo).toHaveBeenCalledWith('Cliente excluído. No protótipo, os dados não são gravados.')
  })

  it('a recusa do servidor aparece dentro da janela, que continua aberta', async () => {
    vi.mocked(inativarCliente).mockResolvedValue({ ok: false, mensagem: 'Este cliente já está inativo.' })
    montar(cliente('cli-atlantica', 'Ativo'))
    await escolher('Inativar')
    const janela = await screen.findByRole('alertdialog')
    await userEvent.click(within(janela).getByRole('button', { name: 'Inativar' }))
    expect(await within(janela).findByText('Este cliente já está inativo.')).toBeInTheDocument()
    expect(avisarSalvo).not.toHaveBeenCalled()
  })

  it('enquanto a ação roda, o botão de confirmar fica em carregando', async () => {
    let terminar: (r: { ok: true; mensagem: string }) => void = () => {}
    vi.mocked(inativarCliente).mockReturnValue(new Promise((resolve) => (terminar = resolve)))
    montar(cliente('cli-atlantica', 'Ativo'))
    await escolher('Inativar')
    const janela = await screen.findByRole('alertdialog')
    await userEvent.click(within(janela).getByRole('button', { name: 'Inativar' }))
    expect(within(janela).getByRole('button', { name: /Inativar/ })).toHaveAttribute('aria-busy', 'true')
    terminar({ ok: true, mensagem: 'ok' })
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
  })
})

import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { avisarSalvo } from '@/lib/avisos'
import { excluirDocumento, inativarDocumento, mudarStatusDocumento, reativarDocumento } from '@/lib/documentos/acoes'
import { AcoesDocumento } from './acoes-documento'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/lib/documentos/acoes', () => ({
  mudarStatusDocumento: vi.fn(),
  inativarDocumento: vi.fn(),
  reativarDocumento: vi.fn(),
  excluirDocumento: vi.fn(),
}))
vi.mock('@/lib/avisos', () => ({ avisarSalvo: vi.fn() }))

const SUCESSO = { ok: true, mensagem: 'Feito. No protótipo, os dados não são gravados.' } as const

beforeEach(() => {
  push.mockReset()
  for (const f of [mudarStatusDocumento, inativarDocumento, reativarDocumento, excluirDocumento]) vi.mocked(f).mockReset()
  vi.mocked(avisarSalvo).mockReset()
})

type Props = Parameters<typeof AcoesDocumento>[0]

const BASE: Props = {
  documentoId: 'doc-1',
  status: 'Vigente',
  inativo: false,
  substitutos: [
    { id: 'doc-2', nome: 'Versão nova' },
    { id: 'doc-3', nome: 'Outro relatório' },
  ],
  podeExcluir: true,
}

const montar = (props: Partial<Props> = {}) =>
  render(
    <TooltipProvider>
      <AcoesDocumento {...BASE} {...props} />
    </TooltipProvider>,
  )

async function itens() {
  await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
  const menu = within(await screen.findByRole('menu'))
  const nomes = menu.getAllByRole('menuitem').map((i) => i.textContent)
  await userEvent.keyboard('{Escape}')
  return nomes
}

async function escolher(item: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }))
  await userEvent.click(within(await screen.findByRole('menu')).getByRole('menuitem', { name: item }))
  return within(await screen.findByRole('alertdialog'))
}

describe('AcoesDocumento (parte 6, 4.4; PRD 6.1)', () => {
  it('no Vigente: Encerrar, Marcar como Superado, Inativar e Excluir; no Superado, Voltar a Vigente; no inativo, Reativar', async () => {
    const { unmount } = montar()
    expect(await itens()).toEqual(['Encerrar', 'Marcar como Superado', 'Inativar', 'Excluir'])
    unmount()
    const outro = montar({ status: 'Superado', inativo: true, podeExcluir: false })
    expect(await itens()).toEqual(['Voltar a Vigente', 'Reativar'])
    outro.unmount()
  })

  it('encerrar pede confirmação e avisa', async () => {
    vi.mocked(mudarStatusDocumento).mockResolvedValue(SUCESSO)
    montar()
    const janela = await escolher('Encerrar')
    await userEvent.click(janela.getByRole('button', { name: 'Encerrar' }))
    await waitFor(() => expect(mudarStatusDocumento).toHaveBeenCalledWith('doc-1', 'encerrar', ''))
    expect(avisarSalvo).toHaveBeenCalledWith(SUCESSO.mensagem)
  })

  it('marcar como Superado exige escolher o substituto (CA-12.4)', async () => {
    vi.mocked(mudarStatusDocumento).mockResolvedValue(SUCESSO)
    montar()
    const janela = await escolher('Marcar como Superado')
    await userEvent.click(janela.getByRole('button', { name: 'Marcar como Superado' }))
    expect(janela.getByText('Escolha o documento que substitui este.')).toBeInTheDocument()
    expect(mudarStatusDocumento).not.toHaveBeenCalled()
    await userEvent.click(janela.getByRole('radio', { name: 'Versão nova' }))
    await userEvent.click(janela.getByRole('button', { name: 'Marcar como Superado' }))
    await waitFor(() => expect(mudarStatusDocumento).toHaveBeenCalledWith('doc-1', 'marcar-superado', 'doc-2'))
  })

  it('sem substituto possível, a janela explica e não confirma', async () => {
    montar({ substitutos: [] })
    const janela = await escolher('Marcar como Superado')
    expect(janela.getByText(/Nenhum outro documento Vigente/)).toBeInTheDocument()
    expect(janela.queryByRole('button', { name: 'Marcar como Superado' })).not.toBeInTheDocument()
  })

  it('a recusa do servidor aparece na janela', async () => {
    vi.mocked(inativarDocumento).mockResolvedValue({ ok: false, mensagem: 'O documento já está inativo.' })
    montar()
    const janela = await escolher('Inativar')
    await userEvent.click(janela.getByRole('button', { name: 'Inativar' }))
    expect(await janela.findByText('O documento já está inativo.')).toBeInTheDocument()
  })

  it('excluir volta para a lista com os filtros que estavam aplicados (revisão do código)', async () => {
    sessionStorage.setItem('elo:filtros-documentos', 'categoria=Contrato')
    vi.mocked(excluirDocumento).mockResolvedValue(SUCESSO)
    montar()
    const janela = await escolher('Excluir')
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Arquivo errado.')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/documentos?categoria=Contrato'))
    sessionStorage.clear()
  })

  it('excluir pede a justificativa e volta para a lista (DF-33)', async () => {
    vi.mocked(excluirDocumento).mockResolvedValue(SUCESSO)
    montar()
    const janela = await escolher('Excluir')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    expect(janela.getByText('Escreva a justificativa da exclusão.')).toBeInTheDocument()
    await userEvent.type(janela.getByRole('textbox', { name: /Justificativa/ }), 'Arquivo errado.')
    await userEvent.click(janela.getByRole('button', { name: 'Excluir' }))
    await waitFor(() => expect(excluirDocumento).toHaveBeenCalledWith('doc-1', 'Arquivo errado.'))
    expect(push).toHaveBeenCalledWith('/documentos')
  })
})
